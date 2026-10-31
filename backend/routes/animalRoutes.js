
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  registerAnimal,
  getAllAnimals,
  getAnimalById,
} = require("../controllers/animalController");

// Register an animal (logged-in users only)
router.post("/", protect, registerAnimal);

// Get all registered animals
router.get("/", protect, getAllAnimals);

// Get a specific animal
router.get("/:id", protect, getAnimalById);

module.exports = router;
