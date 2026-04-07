const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const app = require("../../app");
const User = require("../../models/User");

const TEST_IMAGE_URL = "https://example.com/avatar.png";
const TEST_IMAGE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5B7j0AAAAASUVORK5CYII=";

// Test suite for core authentication API scenarios.
describe("Auth API Tests", () => {
  let mongoServer;

  // Start and connect to an in-memory MongoDB before all tests.
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      dbName: "community-library-test",
    });
  });

  // Clear all data after each test to keep test cases isolated.
  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  });

  // Close DB connection and stop in-memory MongoDB after all tests.
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Success case: user can register with valid required fields.
  test("Register creates a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "testuser@example.com",
      password: "123456",
      profileImageUrl: TEST_IMAGE_DATA_URL,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toBeTruthy();
    expect(res.body.user.username).toBe("testuser");
  });

  // Failure case: returns 400 when required fields are missing.
  test("Register fails if required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "missingemail",
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "username, email, password, and profileImageUrl are required"
    );
  });

  // Failure case: returns 400 when image URL is invalid.
  test("Register fails if image URL is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "badimage",
      email: "badimage@example.com",
      password: "123456",
      profileImageUrl: "not-a-url",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "profileImageUrl must be a valid image URL or data URL"
    );
  });

  // Failure case: returns 409 when username or email already exists.
  test("Register fails when username already exists", async () => {
    await request(app).post("/api/auth/register").send({
      username: "dupeuser",
      email: "dupe1@example.com",
      password: "123456",
      profileImageUrl: TEST_IMAGE_DATA_URL,
    });

    const res = await request(app).post("/api/auth/register").send({
      username: "dupeuser",
      email: "dupe2@example.com",
      password: "123456",
      profileImageUrl: TEST_IMAGE_DATA_URL,
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("username or email already exists");
  });

  // Success case: registered user can log in with correct password.
  test("Login works with correct credentials", async () => {
    await request(app).post("/api/auth/register").send({
      username: "john",
      email: "john@example.com",
      password: "password123",
      profileImageUrl: TEST_IMAGE_DATA_URL,
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "john",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toBeTruthy();
    expect(res.body.user.username).toBe("john");
  });

  // Failure case: returns 401 when password is incorrect.
  test("Login fails with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      username: "john2",
      email: "john2@example.com",
      password: "password123",
      profileImageUrl: TEST_IMAGE_DATA_URL,
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "john2",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("invalid credentials");
  });

  // Failure case: returns 401 when user does not exist.
  test("Login fails if user does not exist", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "nouser",
      password: "123",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("invalid credentials");
  });

  // Failure case: returns 400 when identifier is missing.
  test("Login fails if identifier is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("identifier and password are required");
  });

  // Failure case: suspended users are blocked with 403.
  test("Login fails when account is suspended", async () => {
    await request(app).post("/api/auth/register").send({
      username: "suspendeduser",
      email: "suspended@example.com",
      password: "password123",
      profileImageUrl: TEST_IMAGE_DATA_URL,
    });

    // Mark the test user as suspended before login attempt.
    await User.updateOne(
      { username: "suspendeduser" },
      { $set: { status: "suspended" } }
    );

    const res = await request(app).post("/api/auth/login").send({
      username: "suspendeduser",
      password: "password123",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("your account has been suspended");
  });
});
