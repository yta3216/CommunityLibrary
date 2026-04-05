// load backend dependencies for server and middleware setup
const express = require("express");
const cors = require("cors");

// import grouped route modules
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const booksRouter = require("./routes/books");
const chatsRouter = require("./routes/chats");
const reviewsRouter = require("./routes/reviews");

// create express app and enable common middleware
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// simple health endpoint to check if api server is alive
app.get("/api/health", (_req, res) => {
  res.json({ message: "ok" });
});

// mount feature routers under api paths
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/books", booksRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/reviews", reviewsRouter);

module.exports = app;