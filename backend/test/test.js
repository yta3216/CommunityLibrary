const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const app = require("../app");

describe("Auth API Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      dbName: "community-library-test",
    });
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("Register creates a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "testuser@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("registered");
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe("testuser");
  });

  test("Login works with correct credentials", async () => {
    await request(app).post("/api/auth/register").send({
      username: "john",
      email: "john@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "john",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("logged in");
    expect(res.body.token).toBeDefined();
  });

  test("Login fails with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      username: "john2",
      email: "john2@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "john2",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("invalid credentials");
  });

  test("Login fails if user does not exist", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "nouser",
      password: "123",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("invalid credentials");
  });
});