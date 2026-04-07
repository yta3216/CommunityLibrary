// load backend dependencies for server and middleware setup
const express = require("express");
const cors = require("cors");

// import grouped route modules
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/userRouter");
const booksRouter = require("./routes/bookRouter");
const chatsRouter = require("./routes/chatRouter");
const reviewsRouter = require("./routes/reviewRouter");
const sseRouter = require("./routes/sseRouter");

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
app.use("/api/live", sseRouter);

// central error handler so service-layer validation returns a clean response
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "internal server error",
  });
});

module.exports = app;