const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { getIO } = require("../utils/socket");
const authMiddleware = require("../middleware/authMiddleware");

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, phone, role } = req.body;

    const user = await User.create({
      name,
      phone,
      role
    });

    res.status(201).json({
      message: "User created successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error.message
    });
  }
  router.put("/driver/:id/status", authMiddleware, async (req, res) => {
  try {

    const { isOnline, lat, lng } = req.body;

    const updatedDriver = await User.findByIdAndUpdate(
      req.params.id,
      {
        isOnline,
        location: {
          lat,
          lng
        }
      },
      { new: true }
    );
const { getIO } = require("../utils/socket");

const io = getIO();

io.emit("driverLocationUpdated", updatedDriver);
    res.json({
      message: "Driver updated successfully",
      driver: updatedDriver
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating driver",
      error: error.message
    });

  }
});
});

module.exports = router;