const express = require("express");
const router = express.Router();

const Ride = require("../models/Ride");

const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");

router.get(
  "/earnings/:driverId",

  authMiddleware,

  roleMiddleware(["driver"]),

  async (req, res) => {

    try {

      const rides =
        await Ride.find({

          driverId:
            req.params.driverId,

          status:
            "completed"

        });

      const totalEarnings =
        rides.reduce(

          (sum, ride) =>
            sum + (ride.fare || 0),

          0

        );

        const today =
  new Date();

today.setHours(
  0,0,0,0
);

const todayRides =
  rides.filter(

    ride =>

      new Date(
        ride.createdAt
      ) >= today

  );

const todayEarnings =
  todayRides.reduce(

    (sum, ride) =>

      sum + ride.fare,

    0

  );

      const totalTrips =
        rides.length;

      res.json({

        totalEarnings,

        totalTrips,

        todayEarnings,

        todayRides: todayRides.length,

        rides

      });

    } catch (error) {

      res.status(500).json({

        message:
          "Failed to load earnings"

      });

    }

  }

);

module.exports = router;