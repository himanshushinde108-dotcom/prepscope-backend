const app = require("../src/app");
const connectDB = require("../config/database");

let connectionPromise;

async function handler(req, res) {
  const apiPath = req.query?.__api_path;
  if (typeof apiPath === "string") {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key === "__api_path") {
        continue;
      }
      for (const item of Array.isArray(value) ? value : [value]) {
        if (typeof item === "string") {
          query.append(key, item);
        }
      }
    }

    req.url = `/api/${apiPath}${query.toString() ? `?${query}` : ""}`;
  }

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
