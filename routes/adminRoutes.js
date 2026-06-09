const express =
  require("express");

const router =
  express.Router();

const User =
  require("../models/User");

const Ride =
  require("../models/Ride");

const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");
console.log("roleMiddleware type:", typeof roleMiddleware);

/* GET ALL USERS */

router.get(
  "/users",
  //authMiddleware,
  //roleMiddleware(["admin"]),

  async (req, res) => {

    try {

      const users =
        await User.find()
          .select("-password");

      res.json(users);

    } catch (error) {

      res.status(500).json({
        message:
          "Failed to fetch users"
      });

    }

  }
);



/* GET ALL RIDES */

router.get(
  "/rides",
  authMiddleware,
  roleMiddleware(["admin"]),

  async (req, res) => {

    try {

      const rides =
        await Ride.find()
          .sort({
            createdAt: -1
          });

      res.json(rides);

    } catch (error) {

      res.status(500).json({
        message:
          "Failed to fetch rides"
      });

    }

  }
);



/* DASHBOARD ANALYTICS */

router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware(["admin"]),

  async (req, res) => {

    try {

      const totalUsers =
        await User.countDocuments();

      const totalDrivers =
        await User.countDocuments({
          role: "driver"
        });

      const totalPassengers =
        await User.countDocuments({
          role: "passenger"
        });

      const totalRides =
        await Ride.countDocuments();

      const completedRides =
        await Ride.countDocuments({
          status: "completed"
        });

      res.json({

        totalUsers,

        totalDrivers,

        totalPassengers,

        totalRides,

        completedRides

      });

    } catch (error) {

      res.status(500).json({
        message:
          "Analytics failed"
      });

    }

  }
);



module.exports = router;