import request from "supertest"; //simulates HTTP requests
import app from "./app.js";

describe("Auth API Tests", () => { //used to group related tests together.

  test("Signup creates a new user", async () => {
    const res = await request(app)
      .post("/signup") //sends post request to signup
       //includes JSON data (like form submission)
      .send({ username: "testuser", password: "123456" });

    //Then checks: - server respoded correctly, user was created  
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created");
  });

  test("Login works with correct credentials", async () => {
    // First signup
    await request(app)
      .post("/signup") //sends post request to signup
      .send({ username: "john", password: "password123" });

    // Then login
    const res = await request(app)
      .post("/login")
      .send({ username: "john", password: "password123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
  });

  test("Login fails with wrong password", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "john", password: "wrongpass" });

    expect(res.statusCode).toBe(401);
  });

  test("Login fails if user does not exist", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "nouser", password: "123" });

    expect(res.statusCode).toBe(404);
  });

});