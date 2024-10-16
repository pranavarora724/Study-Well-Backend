
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },

        description:{
            type:String,
            required:true
        },

        instructor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },

        whatWillYouLearn:{
            type:String,
            required:true
        },

        price:{
            type:Number,
            required:true
        },

        thumbnail:{
            type:String,
            required:true
        },

        studentsEnrolled:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }],

        // One course can have may tags like  #ai #webdevelopment #software #development"
        tag:{
            type:[String]
        },

        // One course can have only one category
        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        },

        ratingAndReviews:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview"
        }],

        courseContent:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseSection"
        }], 

        instructions:{
            type:[String]
        },

        status:{
            type:String,
            enum:["Draft" , "Published"]
        }
        
        

    }
)

const Course = mongoose.model("Course" , courseSchema);
module.exports = Course;