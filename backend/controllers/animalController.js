
const Animal = require("../models/Animal");

// Register a new stray animal
const registerAnimal = async (req, res) => {
  try {
    const {
      name,
      animalType,
      breed,
      gender,
      estimatedAge,
      color,
      description,
      location,
      vaccination,
      sterilization,
      healthStatus,
      imageUrl,
    } = req.body;

    // Validate required fields
    if (
      !animalType ||
      !location ||
      location.latitude === undefined ||
      location.longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Animal type and GPS coordinates are required.",
      });
    }

    // Create animal record
    const animal = await Animal.create({
      name,
      animalType,
      breed,
      gender,
      estimatedAge,
      color,
      description,
      location,
      vaccination,
      sterilization,
      healthStatus,
      imageUrl,
      registeredBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Animal registered successfully!",
      animal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all registered animals
const getAllAnimals = async (req, res) => {
  try {
    const animals = await Animal.find()
      .populate("registeredBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: animals.length,
      animals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one animal by its database ID
const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate("registeredBy", "name email");

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found.",
      });
    }

    res.status(200).json({
      success: true,
      animal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerAnimal,
  getAllAnimals,
  getAnimalById,
};
