const crypto = require('crypto');

const SECRET = process.env.ORDER_SIGNING_SECRET || 'opv-live-hmac-secret-2026-key';
global.__OPV_ORDERS = global.__OPV_ORDERS || new Map();

function verifyOrderToken(token) {
  if (!token || !token.includes('.')) return null;
  const [json, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(json).digest('base64url');
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(json, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
}

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
    const { token, paymentMethod } = body;
    const order = verifyOrderToken(token);
    if (!order) {
      return res.status(400).json({ ok: false, error: 'Invalid or expired checkout session.' });
    }

    order.status = 'Received — Under Document Review';
    order.paidAt = new Date().toISOString();
    order.paymentMethod = paymentMethod || 'Card';
    order.receiptNumber = 'RCP-' + order.reference.replace('OPV-', '');
    global.__OPV_ORDERS.set(order.reference, order);

    const updatedToken = signOrderPayload(order);

    let emailDispatched = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const hasFeeBreakdown = Number.isFinite(order.baseServiceTotalUSD) && Number.isFinite(order.priorityTotalUSD);
        const baseServiceTotal = hasFeeBreakdown ? order.baseServiceTotalUSD : order.serviceTotalUSD;
        const serviceLabel = hasFeeBreakdown ? 'OnePassVisa base service fee' : 'Service and selected options';
        const priorityLine = hasFeeBreakdown && order.priorityTotalUSD > 0
          ? `<strong>Optional priority review:</strong> $${order.priorityTotalUSD.toFixed(2)} USD<br/>`
          : '';
        const emailHtml = `
          <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0F172A;">
            <h2 style="color:#0E5C9E;">OnePassVisa.com — Application Confirmation &amp; Receipt</h2>
            <p>Thank you. Your application has been received and queued for specialist document review.</p>
            <p><strong>Application Reference:</strong> ${order.reference}<br/>
               <strong>Receipt Number:</strong> ${order.receiptNumber}<br/>
               <strong>Document:</strong> ${order.visaType}<br/>
               <strong>Travelers:</strong> ${order.travelersCount}<br/>
               <strong>Statutory Government Fee:</strong> $${order.govTotalUSD} USD<br/>
               <strong>${serviceLabel}:</strong> $${Number(baseServiceTotal).toFixed(2)} USD<br/>
               ${priorityLine}
               <strong>Total Paid:</strong> $${order.grandTotalUSD} USD</p>
            <p><strong>Next Steps:</strong> Our team will verify your passport scan and photo (${order.ourHandlingTime}) before submitting to ${order.govPortalName}.</p>
            <p style="font-size:12px;color:#475569;">OnePassVisa.com is a private assistance service not affiliated with any government.</p>
          </div>
        `;
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'OnePassVisa Support <support@onepassvisa.com>',
            to: [order.email],
            subject: `Confirmation & Receipt ${order.reference} — ${order.visaType}`,
            html: emailHtml
          })
        });
        emailDispatched = r.ok;
      } catch (e) {
        emailDispatched = false;
      }
    }

    return res.status(200).json({
      ok: true,
      order,
      token: updatedToken,
      emailDispatched
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Payment confirmation failed.' });
  }
};
