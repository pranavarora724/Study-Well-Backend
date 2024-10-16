
const mongoose = require('mongoose');

const ratingAndReviewSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },

        courseId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        },

        rating:{
            type:Number
        },

        review:{
            type:String
        }
    }
)

const RatingAndReview = mongoose.model("RatingAndReview" , ratingAndReviewSchema);
module.exports = RatingAndReview;