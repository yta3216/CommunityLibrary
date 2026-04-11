const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const app = require("../../app");
const Book = require("../../models/Book");

const TEST_IMAGE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5B7j0AAAAASUVORK5CYII=";

describe("Book API Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      dbName: "community-library-book-test",
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

  const registerUser = async ({ username, email, role } = {}) => {
    const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const payload = {
      username: username || `user${unique}`,
      email: email || `${unique}@example.com`,
      password: "password123",
      profileImageUrl: TEST_IMAGE_DATA_URL,
    };

    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.statusCode).toBe(201);

    if (role === "admin") {
      const userId = res.body.user._id;
      await mongoose.connection.collection("users").updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { role: "admin" } }
      );

      const loginRes = await request(app).post("/api/auth/login").send({
        username: payload.username,
        password: payload.password,
      });
      expect(loginRes.statusCode).toBe(200);
      return {
        token: loginRes.body.token,
        user: loginRes.body.user,
      };
    }

    return {
      token: res.body.token,
      user: res.body.user,
    };
  };

  const createBookListing = async (ownerId, overrides = {}) => {
    return Book.create({
      isbn: overrides.isbn || 978410101001,
      title: overrides.title || "Clean Architecture",
      author: overrides.author || "Robert C. Martin",
      genre: overrides.genre || "Software",
      description: overrides.description || "Book for architecture practices.",
      owner: ownerId,
      holder: overrides.holder || ownerId,
      ownerLocked: overrides.ownerLocked || false,
    });
  };

  test("GET /api/books returns list with essential fields", async () => {
    const owner = await registerUser();

    await createBookListing(owner.user._id, {
      isbn: 978410101111,
      title: "Book One",
    });
    await createBookListing(owner.user._id, {
      isbn: 978410101222,
      title: "Book Two",
    });

    const res = await request(app).get("/api/books");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    const first = res.body[0];
    expect(first).toHaveProperty("_id");
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("author");
    expect(first).toHaveProperty("status");
    expect(first).toHaveProperty("owner");
    expect(first).toHaveProperty("holder");
  });

  test("GET /api/books/:id returns book detail for authenticated user", async () => {
    const owner = await registerUser({ username: "bookowner", email: "owner@example.com" });
    const viewer = await registerUser({ username: "bookviewer", email: "viewer@example.com" });
    const book = await createBookListing(owner.user._id, {
      isbn: 978410101333,
      title: "Domain-Driven Design",
      author: "Eric Evans",
      description: "Strategic and tactical DDD patterns.",
    });

    const res = await request(app)
      .get(`/api/books/${book._id}`)
      .set("Authorization", `Bearer ${viewer.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", String(book._id));
    expect(res.body).toHaveProperty("title", "Domain-Driven Design");
    expect(res.body).toHaveProperty("author", "Eric Evans");
    expect(res.body).toHaveProperty("description", "Strategic and tactical DDD patterns.");
    expect(res.body).toHaveProperty("ownerName");
    expect(res.body).toHaveProperty("canBorrow");
    expect(res.body).toHaveProperty("showBorrowButton");
  });

  test("GET /api/books/:id returns 404 when book does not exist", async () => {
    const viewer = await registerUser({ username: "missingviewer", email: "missingviewer@example.com" });
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/books/${missingId}`)
      .set("Authorization", `Bearer ${viewer.token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("book not found");
  });

  test("PATCH /api/books/:id returns 403 when non-owner tries to update", async () => {
    const owner = await registerUser({ username: "owneruser", email: "owneruser@example.com" });
    const otherUser = await registerUser({ username: "otheruser", email: "otheruser@example.com" });
    const book = await createBookListing(owner.user._id, {
      isbn: 978410101444,
      title: "Original Title",
    });

    const res = await request(app)
      .patch(`/api/books/${book._id}`)
      .set("Authorization", `Bearer ${otherUser.token}`)
      .send({ title: "Updated by other user" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("forbidden");
  });

  test("POST /api/books creates a new book for authenticated user", async () => {
    const owner = await registerUser({ username: "createowner", email: "createowner@example.com" });

    const payload = {
      isbn: "978410109999",
      title: "The Pragmatic Programmer",
      author: "Andy Hunt",
      genre: "Software Engineering",
      description: "Practical software craftsmanship guidance.",
    };

    const res = await request(app)
      .post("/api/books")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("title", payload.title);
    expect(res.body).toHaveProperty("author", payload.author);
    expect(res.body).toHaveProperty("owner._id", owner.user._id);
    expect(res.body).toHaveProperty("holder._id", owner.user._id);
  });

  test("POST /api/books returns 401 when request is unauthenticated", async () => {
    const payload = {
      isbn: "978410108888",
      title: "Patterns of Enterprise Application Architecture",
      author: "Martin Fowler",
      genre: "Software",
      description: "Catalog of enterprise patterns.",
    };

    const res = await request(app).post("/api/books").send(payload);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("authorization token is required");
  });
});
