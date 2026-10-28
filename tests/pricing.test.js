'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const DATA = require('../assets/js/data-v6.js');

// Approved government and optional priority amounts before the base-fee change.
// These are regression fixtures, not a claim that government tariffs are current.
const EXISTING_FEES = {
  vietnam: [25, 20], 'thailand-tdac': [0, 15], indonesia: [35, 20], uk: [26, 20],
  usa: [40.62, 20], india: [25, 20], singapore: [0, 15], cambodia: [30, 20],
  uae: [95, 25], saudi: [108, 25], turkey: [52, 20], egypt: [25, 20],
  kenya: [34, 20], canada: [5, 20], australia: [14, 20], malaysia: [0, 15],
  'thailand-evisa': [40, 20], morocco: [77, 20]
};
const BASE_CENTS = 5999;
const TEST_SECRET = 'onepassvisa-pricing-tests-only';
const cents = value => Math.round(value * 100);

function loadHandler(filename, fetchMock, env = {}) {
  const sandbox = {
    module: { exports: {} },
    require(id) {
      if (id === 'crypto') return crypto;
      if (id === '../assets/js/data-v6.js') return DATA;
      throw new Error(`Unexpected dependency in isolated handler test: ${id}`);
    },
    process: { env: { ORDER_SIGNING_SECRET: TEST_SECRET, ...env } },
    global: { __OPV_ORDERS: new Map() },
    Buffer,
    URLSearchParams,
    fetch: fetchMock || (() => { throw new Error('Unexpected network request in test'); })
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', filename), 'utf8'), sandbox, { filename });
  return sandbox.module.exports;
}

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };
}

function requestBody(destinationId, speedTier, count) {
  return {
    destinationId, speedTier, email: 'traveler@example.test', currency: 'USD',
    arrivalDate: '2030-12-20', flightNumber: 'TEST100',
    accommodationAddress: 'Example accommodation for isolated unit testing',
    applicants: Array.from({ length: count }, (_, index) => ({
      givenName: 'Example', surname: `Traveler${index + 1}`, nationality: 'US',
      dob: '1990-01-01', passportNumber: `EXAMPLE${index + 1}`, passportExpiry: '2035-12-20',
      passportFileName: 'example-passport.jpg', photoFileName: 'example-photo.jpg'
    }))
  };
}

function lineItems(params) {
  const items = new Map();
  for (const [key, value] of params) {
    const match = /^line_items\[(\d+)\]\[(.*)$/.exec(key);
    if (!match) continue;
    const index = Number(match[1]);
    if (!items.has(index)) items.set(index, {});
    const item = items.get(index);
    if (key.endsWith('[product_data][name]')) item.name = value;
    if (key.endsWith('[unit_amount]')) item.unitAmount = Number(value);
    if (key.endsWith('[quantity]')) item.quantity = Number(value);
    if (key.endsWith('[currency]')) item.currency = value;
  }
  return [...items.entries()].sort((a, b) => a[0] - b[0]).map(([, value]) => value);
}

function signedOrder(order) {
  const payload = Buffer.from(JSON.stringify(order)).toString('base64url');
  const signature = crypto.createHmac('sha256', TEST_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function decodeOrder(token) {
  const [payload, signature] = token.split('.');
  assert.equal(signature, crypto.createHmac('sha256', TEST_SECRET).update(payload).digest('base64url'));
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}

function receiptOrder(extra = {}) {
  return {
    reference: 'OPV-TEST-PRICING', visaType: 'Example travel document',
    travelersCount: 2, email: 'traveler@example.test', ourHandlingTime: 'Standard review',
    govPortalName: 'Example government portal', govTotalUSD: 50,
    serviceTotalUSD: 159.98, grandTotalUSD: 209.98,
    ...extra
  };
}

test('one base service fee applies to all 18 documents without changing other fee amounts', () => {
  assert.equal(DATA.baseServiceFeeUSD, 59.99);
  assert.equal(DATA.destinations.length, 18);
  assert.deepEqual(DATA.destinations.map(d => d.id).sort(), Object.keys(EXISTING_FEES).sort());
  for (const destination of DATA.destinations) {
    assert.equal(destination.serviceFeeUSD, 59.99, destination.id);
    assert.equal(destination.govFeeUSD, EXISTING_FEES[destination.id][0], `${destination.id}: government fee`);
    assert.equal(destination.priorityFeeUSD, EXISTING_FEES[destination.id][1], `${destination.id}: priority fee`);
  }
});

for (const [destinationId, [government, priority]] of Object.entries(EXISTING_FEES)) {
  for (const tier of ['standard', 'priority']) {
    for (const travelers of [1, 2, 20]) {
      test(`${destinationId}: ${tier}, ${travelers} traveler(s), exact fee components`, () => {
        const pricing = DATA.calculatePrice(destinationId, travelers, tier);
        const priorityCents = tier === 'priority' ? cents(priority) : 0;
        const governmentCents = cents(government);
        const totalPerPersonCents = BASE_CENTS + priorityCents + governmentCents;
        assert.equal(pricing.travelers, travelers);
        assert.equal(pricing.servicePerPersonUSD, 59.99);
        assert.equal(cents(pricing.speedPerPersonUSD), priorityCents);
        assert.equal(cents(pricing.govPerPersonUSD), governmentCents);
        assert.equal(cents(pricing.baseServiceTotalUSD), BASE_CENTS * travelers);
        assert.equal(cents(pricing.priorityTotalUSD), priorityCents * travelers);
        assert.equal(cents(pricing.govTotalUSD), governmentCents * travelers);
        assert.equal(cents(pricing.serviceTotalUSD), (BASE_CENTS + priorityCents) * travelers);
        assert.equal(cents(pricing.totalServicePerPersonUSD), BASE_CENTS + priorityCents);
        assert.equal(cents(pricing.totalPerPersonUSD), totalPerPersonCents);
        assert.equal(cents(pricing.grandTotalUSD), totalPerPersonCents * travelers);
        assert.equal(pricing.grandTotalUSD, totalPerPersonCents * travelers / 100);
        assert.equal(pricing.baseServiceTotalUSD, BASE_CENTS * travelers / 100);
        assert.equal(DATA.formatMoney(pricing.servicePerPersonUSD, 'USD'), 'US$59.99');
      });
    }
  }
}

test('pricing keeps existing traveler bounds and invalid-tier behavior', () => {
  assert.equal(DATA.calculatePrice('vietnam', 0, 'standard').travelers, 1);
  assert.equal(DATA.calculatePrice('vietnam', 200, 'priority').travelers, 20);
  assert.equal(DATA.calculatePrice('vietnam', 2, 'unrecognized').priorityTotalUSD, 0);
  assert.equal(DATA.calculatePrice('vietnam', 2, 'unrecognized').grandTotalUSD, 169.98);
});

test('all Stripe checkout variants itemize the 5999-cent base separately and sign matching totals', async t => {
  for (const [destinationId, [government, priority]] of Object.entries(EXISTING_FEES)) {
    for (const tier of ['standard', 'priority']) {
      await t.test(`${destinationId}, ${tier}`, async () => {
        const travelers = 2;
        const calls = [];
        const handler = loadHandler('api/submit-application.js', async (url, options) => {
          calls.push({ url, options });
          return { ok: true, json: async () => ({ url: 'https://checkout.example.test/session' }) };
        }, { STRIPE_SECRET_KEY: 'sk_test_isolated_mock_only' });
        const res = responseRecorder();
        await handler({ method: 'POST', headers: { origin: 'https://site.example.test' }, body: requestBody(destinationId, tier, travelers) }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.ok, true);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, 'https://api.stripe.com/v1/checkout/sessions');
        const params = new URLSearchParams(calls[0].options.body);
        const items = lineItems(params);
        const expectedLineCount = 1 + (government > 0 ? 1 : 0) + (tier === 'priority' ? 1 : 0);
        assert.equal(items.length, expectedLineCount);
        const base = items.find(item => /onepassvisa/i.test(item.name) && /base|service/i.test(item.name));
        assert.ok(base, 'base service line exists');
        assert.equal(base.unitAmount, BASE_CENTS);
        assert.equal(base.quantity, travelers);
        const gov = items.find(item => /government/i.test(item.name));
        if (government > 0) assert.equal(gov.unitAmount, cents(government));
        else assert.equal(gov, undefined, 'free official documents are not charged a government line');
        const optional = items.find(item => /priority/i.test(item.name));
        if (tier === 'priority') assert.equal(optional.unitAmount, cents(priority));
        else assert.equal(optional, undefined);
        for (const item of items) {
          assert.equal(item.currency, 'usd');
          assert.equal(item.quantity, travelers);
          assert.ok(Number.isInteger(item.unitAmount));
        }
        const order = decodeOrder(res.body.token);
        assert.equal(order.baseServicePerPersonUSD, 59.99);
        assert.equal(cents(order.baseServiceTotalUSD), BASE_CENTS * travelers);
        assert.equal(cents(order.priorityTotalUSD), (tier === 'priority' ? cents(priority) : 0) * travelers);
        assert.equal(cents(order.govTotalUSD), cents(government) * travelers);
        assert.equal(items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0), cents(order.grandTotalUSD));
        assert.equal(cents(order.serviceTotalUSD), cents(order.baseServiceTotalUSD) + cents(order.priorityTotalUSD));
        assert.equal(params.get('automatic_tax[enabled]'), null, 'this change does not invent tax configuration');
      });
    }
  }
});

test('non-Stripe checkout also returns the same fee components', async () => {
  const handler = loadHandler('api/submit-application.js');
  const res = responseRecorder();
  await handler({ method: 'POST', headers: {}, body: requestBody('thailand-tdac', 'priority', 20) }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.order.baseServiceTotalUSD, 1199.8);
  assert.equal(res.body.order.priorityTotalUSD, 300);
  assert.equal(res.body.order.govTotalUSD, 0);
  assert.equal(res.body.order.grandTotalUSD, 1499.8);
});

test('new confirmation receipts separate base service and optional priority', async () => {
  const emails = [];
  const handler = loadHandler('api/confirm-payment.js', async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    emails.push(JSON.parse(options.body));
    return { ok: true };
  }, { RESEND_API_KEY: 're_test_isolated_mock_only' });
  const original = receiptOrder({ baseServicePerPersonUSD: 59.99, baseServiceTotalUSD: 119.98, priorityTotalUSD: 40 });
  const res = responseRecorder();
  await handler({ method: 'POST', body: { token: signedOrder(original), paymentMethod: 'Card' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.emailDispatched, true);
  assert.equal(emails.length, 1);
  const html = emails[0].html;
  assert.match(html, /base.{0,40}service|service.{0,40}base/i);
  assert.match(html, /119\.98/);
  assert.match(html, /priority/i);
  assert.match(html, /\$40(?:\.00)?\s*USD/);
  assert.match(html, /209\.98/);
  assert.equal(res.body.order.baseServiceTotalUSD, 119.98);
  assert.equal(res.body.order.priorityTotalUSD, 40);
  assert.equal(res.body.order.grandTotalUSD, original.grandTotalUSD);
});

test('legacy receipts preserve historical service and charged totals', async () => {
  const emails = [];
  const handler = loadHandler('api/confirm-payment.js', async (url, options) => {
    emails.push(JSON.parse(options.body));
    return { ok: true };
  }, { RESEND_API_KEY: 're_test_isolated_mock_only' });
  const original = receiptOrder({ serviceTotalUSD: 68, grandTotalUSD: 118 });
  const res = responseRecorder();
  await handler({ method: 'POST', body: { token: signedOrder(original), paymentMethod: 'Card' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.order.serviceTotalUSD, 68);
  assert.equal(res.body.order.grandTotalUSD, 118);
  assert.equal(res.body.order.baseServiceTotalUSD, undefined);
  assert.equal(res.body.order.priorityTotalUSD, undefined);
  const html = emails[0].html;
  assert.match(html, /\$68(?:\.00)?\s*USD/);
  assert.match(html, /\$118(?:\.00)?\s*USD/);
  assert.doesNotMatch(html, /59\.99|119\.98/);
});
