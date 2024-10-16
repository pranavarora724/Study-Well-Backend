
const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema(
    {
        courseId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        },

        completedVideos:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseSubSection"
        }],

        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
    }
)

const CourseProgress = mongoose.model("CourseProgress" , courseProgressSchema);
module.exports = CourseProgress;