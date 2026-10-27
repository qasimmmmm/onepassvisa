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

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const reference = String(body.reference || '').trim().toUpperCase();
    const email = String(body.email || '').trim().toLowerCase();
    const clientTokens = Array.isArray(body.tokens) ? body.tokens : [];

    if (!reference || !email) {
      return res.status(400).json({
        found: false,
        message: 'Please enter both your Application Reference (e.g. OPV-20261027-XXXXXX) and the email address used on your order.'
      });
    }

    let matched = global.__OPV_ORDERS.get(reference) || null;
    if (matched && matched.email.toLowerCase() !== email) {
      matched = null;
    }

    if (!matched) {
      for (const t of clientTokens) {
        const decoded = verifyOrderToken(t);
        if (decoded && decoded.reference === reference && String(decoded.email).toLowerCase() === email) {
          matched = decoded;
          break;
        }
      }
    }

    if (!matched) {
      return res.status(404).json({
        found: false,
        message: `No application was found matching reference "${reference}" and email "${email}". Please verify your confirmation email or contact support@onepassvisa.com.`
      });
    }

    return res.status(200).json({
      found: true,
      order: matched
    });
  } catch (err) {
    return res.status(500).json({
      found: false,
      message: 'Unable to look up application status right now. Please try again shortly.'
    });
  }
};
