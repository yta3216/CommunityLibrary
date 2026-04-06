// load backend dependencies for server, database, and env vars
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// import the configured express app and supporting models
const app = require("./app");
const Chat = require("./models/Chat");

// load values from .env into process.env
dotenv.config();

// use env port if provided, otherwise default to 5000
const port = process.env.PORT || 5000;

// connect to mongodb first, then start listening for requests
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Keep chat indexes in sync so old unique constraints do not block valid requests.
    await Chat.syncIndexes();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
