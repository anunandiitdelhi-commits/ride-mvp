const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({

  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  pickup: {
    type: String,
    required: null
  },

  drop: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: [
      "requested",
      "accepted",
      "started",
      "completed",
      "cancelled"
    ],
    default: "requested"
  },
    fare: {
      type: Number,
      default: 0
},

cancelledBy: {
  type: String,
  default: null
},

cancellationReason: {
  type: String,
  default: null
},

paymentMethod: {
  type: String,
  default: "cash"
},

paymentStatus: {
  type: String,
  default: "pending"
}

}, {
 timestamps: true
});

module.exports = mongoose.model("Ride", rideSchema);