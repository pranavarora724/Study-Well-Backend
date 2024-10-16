
const mongoose = require('mongoose');

const courseSectionSchema = new mongoose.Schema(
    {
        sectionName:{
            type:String, 
            require:true
        },

        course_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course'
        },

        subSection:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseSubSection"
        }]
    }
)

const CourseSection = mongoose.model("CourseSection", courseSectionSchema);
module.exports = CourseSection;