const express =
  require("express");

const router =
  express.Router();

const Review =
  require("../models/Review");

const User =
  require("../models/User");

const authMiddleware =
  require("../middleware/authMiddleware");



router.post(

  "/create",

  authMiddleware,

  async (req, res) => {

    try {

      const {

        rideId,

        reviewTargetId,

        rating,

        comment

      } = req.body;



      const review =
        await Review.create({

          rideId,

          reviewerId:
            req.user.id,

          reviewTargetId,

          rating,

          comment

        });



      const targetUser =
        await User.findById(
          reviewTargetId
        );



      targetUser.ratingSum +=
        rating;

      targetUser.totalRatings += 1;

      targetUser.rating =

        targetUser.ratingSum /

        targetUser.totalRatings;



      await targetUser.save();



      res.json(review);

    } catch (error) {

      res.status(500).json({

        message:
          "Review failed"

      });

    }

  }

);

module.exports = router;