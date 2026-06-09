const express = require("express");

const router = express.Router();

const Ride = require("../models/Ride");
const User = require("../models/User");
const { getIO } = require("../utils/socket");
const authMiddleware = require("../middleware/authMiddleware");
const { getDistance } =
  require("../utils/distance");
const {calculateFare} = require("../utils/fareCalculator");
const createNotification = require("../utils/createNotification");


const roleMiddleware =
  require("../middleware/roleMiddleware");

// CREATE RIDE REQUEST
router.post("/request",
  authMiddleware,roleMiddleware(["passenger"]), async (req, res) => {

  try {

    console.log("BODY:", req.body);
    const { passengerId, pickup, drop } = req.body;
    const [pickupLat, pickupLng] = pickup.split(",");
    const [dropLat, dropLng] = drop.split(",");

    // FIND AVAILABLE DRIVER
    const drivers = await User.find({
  role: "driver",
  isOnline: true
}).select(
      "location isOnline role"
);

console.log("Drivers:", drivers);
console.log("Drivers count:",
  drivers.length);

let nearestDriver = null;
let minDistance = Infinity;

drivers.forEach(driver => {

  if (!driver.location) return;

  const dist = getDistance(

    driver.location.lat,
    driver.location.lng,

    pickupLat,
    pickupLng

  );

  if (dist < minDistance) {

    minDistance = dist;

    nearestDriver = driver;

  }

});

   if (nearestDriver) {

     ride.driverId = nearestDriver._id;

     ride.status = "accepted";
     await createNotification(passengerId, "Driver Assigned", "A driver has been assigned to your ride.");

    }

    //if (!nearestDriver) {
      // return res.status(404).json({
       // message: "No drivers available"
      // });
    // }
     const tripDistance = getDistance(

  parseFloat(pickupLat),
  parseFloat(pickupLng),

  parseFloat(dropLat),
  parseFloat(dropLng)

);

    const fare =
     calculateFare(tripDistance);
    // CREATE RIDE
    const ride = await Ride.create({
      passengerId,
      // driverId: nearestDriver._id,
      pickup,
      drop,
      fare,
      status: "requested"
    });
      await createNotification(passengerId, "Ride Requested", "Your ride request has been created.");
      io = require("../utils/socket").getIO();

      io.emit("newRide", ride);
           

    res.status(201).json({
      message: "Ride created successfully",
      ride
    });

  } catch (error) {
    console.log("RIDE REQUEST ERROR", error);
    res.status(500).json({
      message: "Error creating ride",
      error: error.message
    });

  }

});

router.put("/accept/:rideId",authMiddleware,roleMiddleware(["driver"]), async (req, res) => {

  try {

    const ride = await Ride.findByIdAndUpdate(
      req.params.rideId,

      {
        status: "accepted"
      },

      { new: true }

    );
     io = getIO();

io.emit("rideUpdated",ride);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    res.json({
      message: "Ride accepted successfully",
      ride
    });

  } catch (error) {

    res.status(500).json({
      message: "Error accepting ride",
      error: error.message
    });

  }

});

router.put("/status/:rideId",
  authMiddleware,roleMiddleware(["driver"]), async (req, res) => {

  try {

    const { status } = req.body;

    const allowedStatuses = [
      "accepted",
      "arrived",
      "started",
      "completed"
    ];

    if (!allowedStatuses.includes(status)) {

      return res.status(400).json({
        message: "Invalid status"
      });

    }

    const updatedRide = await Ride.findByIdAndUpdate(

      req.params.rideId,

      {
        status
      },

      { new: true }

    );

    if (!updatedRide) {

      return res.status(404).json({
        message: "Ride not found"
      });

    }

    res.json({
      message: "Ride status updated",
      ride: updatedRide
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating ride",
      error: error.message
    });

  }

});

router.put(
  "/complete/:rideId",

  async (req, res) => {

    try {

      const ride =
        await Ride.findByIdAndUpdate(

          req.params.rideId,

          {
            status: "completed"
          },

          { new: true }

        );

      const io =
        require("../utils/socket")
          .getIO();

      io.emit(
        "rideUpdated",
        ride
      );

      await createNotification(ride.passengerId, "Ride Completed", "Your trip has been complated.");
      res.json({
        message:
          "Ride completed",

        ride
      });

    } catch (error) {

      res.status(500).json({
        message:
          "Completion failed"
      });

    }

  }
);

router.get("/", async (req, res) => {

  try {

    const rides = await Ride.find();

    res.json(rides);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching rides"
    });

  }

});

router.get(
  "/history/:userId",

  async (req, res) => {

    try {

      const rides =
        await Ride.find({

          $or: [

            {
              passengerId:
                req.params.userId
            },

            {
              driverId:
                req.params.userId
            }

          ]

        })
        .sort({ createdAt: -1 });

      res.json(rides);

    } catch (error) {

      res.status(500).json({
        message:
          "Failed to load history"
      });

    }

  }
);

router.put(
  "/cancel/:rideId",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        reason
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

      ride.status =
        "cancelled";

      ride.cancelledBy =
        req.user.role;

      ride.cancellationReason =
        reason;

      await ride.save();
      await createNotification(ride.passengerId, "Ride Cancelled", "Your ride was cancelled");


      const io =
        require("../utils/socket")
          .getIO();

      io.emit(
        "rideUpdated",
        ride
      );

      res.json({

        message:
          "Ride cancelled",

        ride

      });

    } catch (error) {

      res.status(500).json({

        message:
          "Cancellation failed"

      });

    }

  }
);

module.exports = router;