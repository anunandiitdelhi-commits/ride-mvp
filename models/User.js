const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  password: {
  type: String,
  required: true
},

  role: {
    type: String,
    enum: [
  "passenger",
  "driver",
  "admin"
], 
    index: true
  },


  isOnline: {
    type: Boolean,
    default: false,
    index: true
  },

  location: {
    lat: {
      type: Number,
      default: 0
    },

    lng: {
      type: Number,
      default: 0
    }
  },

rating: {
  type: Number,
  default: 5
},

totalRatings: {
  type: Number,
  default: 0
},

ratingSum: {
  type: Number,
  default: 0
}

});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);