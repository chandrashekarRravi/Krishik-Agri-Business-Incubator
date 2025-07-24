import request from 'supertest';
import app from '../index.js';

describe('Auth API', () => {
  it('should return 400 if required fields are missing on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
}); 