const mongoose =
  require("mongoose");

const reviewSchema =
  new mongoose.Schema({

    rideId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "Ride"
    },

    reviewerId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    reviewTargetId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    rating: Number,

    comment: String

  },

  {
    timestamps: true
  }

);

module.exports =
  mongoose.model(
    "Review",
    reviewSchema
  );