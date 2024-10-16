
const mongoose = require('mongoose');

const courseSubSectionSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },

        description:{
            type:String,
            required:true
        },

        

        videoUrl:{
            type:String,
            required:true
        },

        // We need this Video
        //  For Editing purposes - In Frontend
        // We will Store Obbject after Stringifying it
        // Then will convertt back to object 
        videoObject:{
            type:String,
            // required:true
        },

        // We need public id to delete file from cloudinary
        public_id:{
            type:String
        },

        // We added section_id 
        // So that when we delete a asubSection
        // To uske related section se bhi values delete ho jaaye
        section_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseSection"
        }

    }
);

const CourseSubSection =  mongoose.model("CourseSubSection" , courseSubSectionSchema);
module.exports = CourseSubSection;