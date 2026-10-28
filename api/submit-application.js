const crypto = require('crypto');
const DATA = require('../assets/js/data-v6.js');

const SECRET = process.env.ORDER_SIGNING_SECRET || 'opv-live-hmac-secret-2026-key';
global.__OPV_ORDERS = global.__OPV_ORDERS || new Map();

function signOrderPayload(payload) {
  const json = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(json).digest('base64url');
  return `${json}.${sig}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      destinationId,
      speedTier,
      email,
      phone,
      arrivalDate,
      flightNumber,
      portOfEntry,
      accommodationAddress,
      applicants,
      currency
    } = body;

    const selectedDest = DATA.destinations.find((d) => d.id === destinationId);
    if (!destinationId || !selectedDest) {
      return res.status(400).json({ ok: false, error: 'Please select a valid destination.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address for delivery.' });
    }
    if (phone && String(phone).trim().length > 0 && String(phone).trim().length < 6) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid contact phone number or leave it blank.' });
    }
    if (!arrivalDate) {
      return res.status(400).json({ ok: false, error: 'Please select your planned arrival date.' });
    }
    if (selectedDest.requiresFlightAndHotel) {
      if (!flightNumber || String(flightNumber).trim().length < 2) {
        return res.status(400).json({ ok: false, error: 'Please enter your arrival flight or vessel number for this arrival card.' });
      }
      if (!accommodationAddress || String(accommodationAddress).trim().length < 3) {
        return res.status(400).json({ ok: false, error: 'Please enter your hotel name or accommodation address for this arrival card.' });
      }
    }
    if (!Array.isArray(applicants) || applicants.length < 1 || applicants.length > 20) {
      return res.status(400).json({ ok: false, error: 'Please provide details for at least one traveler.' });
    }

    const sanitizedApplicants = [];
    for (let i = 0; i < applicants.length; i++) {
      const a = applicants[i] || {};
      const givenName = String(a.givenName || '').trim();
      const surname = String(a.surname || '').trim();
      const dob = String(a.dob || '').trim();
      const nationality = String(a.nationality || '').trim();
      const passportNumber = String(a.passportNumber || '').trim().toUpperCase();
      const passportExpiry = String(a.passportExpiry || '').trim();

      if (!givenName || !surname) {
        return res.status(400).json({ ok: false, error: `Traveler ${i + 1}: Please enter both given name(s) and surname as shown on passport.` });
      }
      if (!dob) {
        return res.status(400).json({ ok: false, error: `Traveler ${i + 1}: Please enter date of birth.` });
      }
      if (!passportNumber || passportNumber.length < 5) {
        return res.status(400).json({ ok: false, error: `Traveler ${i + 1}: Please enter a valid passport number.` });
      }
      if (!passportExpiry) {
        return res.status(400).json({ ok: false, error: `Traveler ${i + 1}: Please enter passport expiration date.` });
      }

      sanitizedApplicants.push({
        index: i + 1,
        givenName,
        surname,
        dob,
        nationality: nationality || 'US',
        passportNumberMasked: passportNumber.slice(0, 2) + '***' + passportNumber.slice(-2),
        passportExpiry,
        passportFileName: selectedDest.requiresUploads ? (a.passportFileName || 'passport-bio.jpg') : null,
        photoFileName: selectedDest.requiresUploads ? (a.photoFileName || 'portrait-photo.jpg') : null
      });
    }

    const pricing = DATA.calculatePrice(destinationId, sanitizedApplicants.length, speedTier);
    const randHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const reference = `OPV-${datePart}-${randHex}`;

    const orderRecord = {
      reference,
      createdAt: new Date().toISOString(),
      status: 'Pending Payment',
      destinationId: pricing.dest.id,
      destinationName: pricing.dest.name,
      category: pricing.dest.categoryBadge,
      cleanTitle: pricing.dest.cleanTitle || pricing.dest.visaType,
      visaType: pricing.dest.visaType,
      govPortal: pricing.dest.govPortal,
      govPortalName: pricing.dest.govPortalName,
      ourHandlingTime: pricing.speedTier === 'priority' ? pricing.dest.priorityReviewTime : pricing.dest.standardReviewTime,
      govProcessingTime: pricing.dest.govProcessingTime,
      speedTier: pricing.speedTier,
      travelersCount: pricing.travelers,
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      arrivalDate,
      flightNumber: flightNumber ? String(flightNumber).trim() : '',
      portOfEntry: portOfEntry ? String(portOfEntry).trim() : '',
      accommodationAddress: accommodationAddress ? String(accommodationAddress).trim() : '',
      currency: currency || 'USD',
      govTotalUSD: pricing.govTotalUSD,
      serviceTotalUSD: pricing.serviceTotalUSD,
      grandTotalUSD: pricing.grandTotalUSD,
      govPerPersonUSD: pricing.govPerPersonUSD,
      servicePerPersonUSD: pricing.totalServicePerPersonUSD,
      applicants: sanitizedApplicants
    };

    global.__OPV_ORDERS.set(reference, orderRecord);
    const token = signOrderPayload(orderRecord);

    if (process.env.STRIPE_SECRET_KEY) {
      const origin = req.headers.origin || 'https://onepassvisa.com';
      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('customer_email', orderRecord.email);
      params.append('client_reference_id', reference);
      params.append('success_url', `${origin}/checkout?ref=${encodeURIComponent(reference)}&paid=1&token=${encodeURIComponent(token)}`);
      params.append('cancel_url', `${origin}/apply?country=${encodeURIComponent(destinationId)}`);

      params.append('line_items[0][price_data][currency]', 'usd');
      params.append('line_items[0][price_data][product_data][name]', `${pricing.dest.visaType} — OnePassVisa Service Fee`);
      params.append('line_items[0][price_data][unit_amount]', String(Math.round(pricing.totalServicePerPersonUSD * 100)));
      params.append('line_items[0][quantity]', String(pricing.travelers));

      if (pricing.govPerPersonUSD > 0) {
        params.append('line_items[1][price_data][currency]', 'usd');
        params.append('line_items[1][price_data][product_data][name]', `${pricing.dest.name} Statutory Government Fee`);
        params.append('line_items[1][price_data][unit_amount]', String(Math.round(pricing.govPerPersonUSD * 100)));
        params.append('line_items[1][quantity]', String(pricing.travelers));
      }

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      const stripeData = await stripeRes.json();
      if (stripeData && stripeData.url) {
        return res.status(200).json({
          ok: true,
          reference,
          token,
          order: orderRecord,
          checkoutUrl: stripeData.url
        });
      }
    }

    return res.status(200).json({
      ok: true,
      reference,
      token,
      order: orderRecord,
      checkoutUrl: `/checkout?ref=${encodeURIComponent(reference)}&token=${encodeURIComponent(token)}`
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Unable to process application right now. Please try again.' });
  }
};
