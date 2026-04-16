const request = require('supertest');
const app = require('../src/app');

// Reset users before each test to ensure isolation
beforeEach(() => {
  app.resetUsers();
});

describe('GET /', () => {
  it('should return a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Welcome to the DISS Demo API');
  });
});

describe('GET /health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
  });
});

describe('GET /api/users', () => {
  it('should return all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(3);
  });
});

describe('GET /api/users/:id', () => {
  it('should return a single user by ID', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('User not found');
  });
});

describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const newUser = { name: 'Diana', email: 'diana@example.com' };
    const res = await request(app).post('/api/users').send(newUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Diana');
    expect(res.body.email).toBe('diana@example.com');
    expect(res.body).toHaveProperty('id');
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'noname@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Name and email are required');
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'NoEmail' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Name and email are required');
  });

  it('should return 400 if body is empty', async () => {
    const res = await request(app).post('/api/users').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Name and email are required');
  });
});

describe('DELETE /api/users/:id', () => {
  it('should delete an existing user', async () => {
    const res = await request(app).delete('/api/users/2');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: 2,
      name: 'Bob',
      email: 'bob@example.com',
    });

    // Verify user is actually deleted
    const getRes = await request(app).get('/api/users/2');
    expect(getRes.statusCode).toBe(404);
  });

  it('should return 404 when deleting non-existent user', async () => {
    const res = await request(app).delete('/api/users/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('User not found');
  });
});