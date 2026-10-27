const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const reference = String(body.reference || '').trim().toUpperCase();
    const message = String(body.message || '').trim();

    if (!name || name.length < 2) {
      return res.status(400).json({ ok: false, error: 'Please enter your full name.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }
    if (!message || message.length < 10) {
      return res.status(400).json({ ok: false, error: 'Please enter a message of at least 10 characters.' });
    }

    const ticketId = 'SUP-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'OnePassVisa Contact Form <support@onepassvisa.com>',
            to: ['support@onepassvisa.com'],
            reply_to: email,
            subject: `[${ticketId}] Support Inquiry from ${name} ${reference ? '(' + reference + ')' : ''}`,
            text: `Ticket: ${ticketId}\nName: ${name}\nEmail: ${email}\nReference: ${reference || 'N/A'}\n\nMessage:\n${message}`
          })
        });
      } catch (e) {
      }
    }

    return res.status(200).json({
      ok: true,
      ticketId,
      receivedAt: new Date().toISOString(),
      message: `Thank you, ${name}. Your message has been sent to support@onepassvisa.com under ticket ${ticketId}. We will reply to ${email} within 4 business hours.`
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Could not send message. Please email support@onepassvisa.com directly.' });
  }
};
