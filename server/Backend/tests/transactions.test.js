const request = require('supertest');
const app = require('../routes');
const setup = require('./setup');

beforeAll(async () => {
  await setup.setup();
});

afterAll(async () => {
  await setup.teardown();
});

afterEach(async () => {
  await setup.clear();
});

test('create and fetch transaction', async () => {
  const tx = { amount: 15.5, merchant: 'Test Store', description: 'Sample' };
  const createRes = await request(app).post('/api/transactions').send(tx);
  expect([201,200]).toContain(createRes.statusCode);
  expect(createRes.body.amount).toBe(15.5);

  const listRes = await request(app).get('/api/transactions');
  expect(listRes.statusCode).toBe(200);
  expect(Array.isArray(listRes.body)).toBe(true);
  expect(listRes.body.length).toBeGreaterThanOrEqual(1);
});
