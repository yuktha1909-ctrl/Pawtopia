
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const animalRoutes = require("./routes/animalRoutes");

const protect = require("./middleware/authMiddleware");
const authorize = require("./middleware/roleMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Animal routes
app.use("/api/animals", animalRoutes);

// Public test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Pawtopia API 🐾",
  });
});

// Protected profile route
app.get("/api/auth/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Profile fetched successfully",
    user: req.user,
  });
});

// Citizen dashboard
app.get(
  "/api/citizen/dashboard",
  protect,
  authorize("citizen"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Citizen Dashboard",
    });
  }
);

// NGO dashboard
app.get(
  "/api/ngo/dashboard",
  protect,
  authorize("ngo"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to NGO Dashboard",
    });
  }
);

// Veterinarian dashboard
app.get(
  "/api/vet/dashboard",
  protect,
  authorize("veterinarian"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Veterinarian Dashboard",
    });
  }
);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🐾 Pawtopia server running on port ${PORT}`);
  });
};

startServer();
