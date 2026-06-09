const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");


// REGISTER
router.post("/register", async (req, res) => {

  try {

    const {
      name,
      phone,
      password,
      role
    } = req.body;

    const existingUser = await User.findOne({
      phone
    });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists"
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({

      name,
      phone,

      password: hashedPassword,

      role

    });

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Registration failed",
      error: error.message, stack: error.stack
    });

  }

});


// LOGIN
router.post("/login", async (req, res) => {

  try {

    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid credentials"
      });

    }

    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      "SECRET_KEY",

      {
        expiresIn: "7d"
      }

    );

    res.json({

      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }

    });

  } catch (error) {

    res.status(500).json({
      message: "Login failed",
      error: error.message
    });

  }

});

module.exports = router;