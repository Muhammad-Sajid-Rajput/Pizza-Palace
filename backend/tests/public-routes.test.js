import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

test('GET /api/health returns service status', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'OK');
});

test('GET /api/pizzas returns seeded pizza list', async () => {
  const response = await request(app).get('/api/pizzas');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.pizzas));
  assert.ok(response.body.pizzas.length > 0);
});

test('GET /api/orders requires authorization', async () => {
  const response = await request(app).get('/api/orders');

  assert.equal(response.status, 401);
});
