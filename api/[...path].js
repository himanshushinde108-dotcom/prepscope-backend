require("@napi-rs/canvas");

const app = require("../src/app");
const connectDB = require("../config/database");

let connectionPromise;

async function handler(req, res) {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "JWT_SECRET is not configured." });
  }

  if (!process.env.MONGO_URI) {
    return res.status(500).json({ message: "MONGO_URI is not configured." });
  }

  connectionPromise ||= connectDB();
  await connectionPromise;
  return app(req, res);
}

module.exports = handler;
