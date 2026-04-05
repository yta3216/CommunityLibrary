const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

// Start an isolated in-memory MongoDB and connect Mongoose to it.
async function connectTestDb() {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    dbName: "community-library-test",
  });
}

// Clear all collections so each test runs with a clean database state.
async function clearTestDb() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

// Close the DB connection and stop the in-memory MongoDB instance.
async function disconnectTestDb() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = {
  connectTestDb,
  clearTestDb,
  disconnectTestDb,
};
