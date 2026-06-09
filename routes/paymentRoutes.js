const express =
  require("express");

const router =
  express.Router();

const Ride =
  require("../models/Ride");

const authMiddleware =
  require("../middleware/authMiddleware");

router.put(

  "/pay/:rideId",

  authMiddleware,

  async (req, res) => {

    try {

      const {

        paymentMethod

      } = req.body;

      const ride =
        await Ride.findById(
          req.params.rideId
        );

      if (!ride) {

        return res.status(404)
          .json({
            message:
              "Ride not found"
          });

      }

      ride.paymentMethod =
        paymentMethod;

      ride.paymentStatus =
        "paid";

      await ride.save();

      res.json({

        message:
          "Payment successful",

        ride

      });

    } catch (error) {

      res.status(500).json({

        message:
          "Payment failed"

      });

    }

  }

);

module.exports = router;