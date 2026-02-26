const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");
const Book = require("./models/Book");

dotenv.config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // creating test data
    const user = await User.create({
      username: "kiichiro",
      name: "Kiichiro",
      email: "kiichiro@test.com",
      password: "test1234",
      numberOfBooks: 1,
      role: "user",
    });

    const book = await Book.create({
      isbn: "9780000000000",
      title: "Test Book",
      author: "Tester",
      owner: user._id,
      holder: user._id,
      status: "with_owner",
    });

    console.log("User & Book created");
  })
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("Server running");
});
