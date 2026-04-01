const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const booksRouter = require("./routes/books");
const chatsRouter = require("./routes/chats");
const reviewsRouter = require("./routes/reviews");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ message: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/books", booksRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/reviews", reviewsRouter);

module.exports = app;
