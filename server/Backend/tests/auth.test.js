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

test('register and login flow', async () => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Tester', email: 'test@example.com', password: 'pass1234' });

  expect(registerRes.statusCode).toBe(201);
  expect(registerRes.body.token).toBeTruthy();

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'pass1234' });

  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body.token).toBeTruthy();
});
