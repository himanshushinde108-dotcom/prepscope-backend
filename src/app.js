const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require("multer");
const interviewroutes = require("../routes/interview.routes");

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

const authRoutes = require('../routes/auth.routes');

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewroutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const isPayloadLimit = error.code === "LIMIT_FILE_SIZE" || error.code === "LIMIT_FIELD_VALUE";
    const status = isPayloadLimit ? 413 : 400;
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Resume PDF must be 3MB or smaller."
      : error.code === "LIMIT_FIELD_VALUE"
        ? "A form field exceeds the allowed size."
        : error.message;
    return res.status(status).json({ message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with those details already exists." });
  }

  const status = error.statusCode || error.status || 500;
  if (status >= 500) {
    console.error("Request failed:", error);
    return res.status(status).json({ message: "An unexpected server error occurred." });
  }

  return res.status(status).json({ message: error.message || "Request could not be completed." });
});

module.exports = app;