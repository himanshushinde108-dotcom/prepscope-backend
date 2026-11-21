require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./config/database");

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  await connectDB();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = app;

