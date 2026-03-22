// load backend dependencies for server, database, env vars, and cors access
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// import grouped route modules
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const booksRouter = require("./routes/books");

// load values from .env into process.env
dotenv.config();

// create express app and enable common middleware
const app = express();
app.use(cors());
app.use(express.json());

// simple health endpoint to check if api server is alive
app.get("/api/health", (_req, res) => {
  res.json({ message: "ok" });
});

// mount feature routers under api paths
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/books", booksRouter);

// use env port if provided, otherwise default to 5000
const port = process.env.PORT || 5000;

// connect to mongodb first, then start listening for requests
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
