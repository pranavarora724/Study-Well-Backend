// import CourseProgress from '../models/CourseProgress';

const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const mongoose = require('mongoose');
const CourseProgress = require('../models/CourseProgress');
const CourseSubSection = require('../models/CourseSubSection'); 
// const {ObjectId} = require('mongoose')
const { Types } = require('mongoose');

 async function updateCourseProgress(req , res)
{

    try {   
    const {courseId , subSectionId} = req.body;
    const userId = req.userDetails.id;
    console.log("Course id = " , courseId);
    console.log("inisde course progress");
    // courseId = new mongoose.Types.ObjectId(courseId);
    // const id = new mongoose.Types.ObjectId(courseId);
    console.log(mongoose.isObjectIdOrHexString(courseId));
    // console.log("Type ofcourseId =  " , id);

    // Get the subSection
    const subSection = await CourseSubSection.findOne(
        {_id:subSectionId}
    );

    // Get the CourseProgress Id
    const courseProgress = await CourseProgress.findOne(
        {
            courseId:courseId,
            userId:userId
        }
    )

    // Check if subsection exists or not
    if(!subSection)
    {
        return(res.json(400).json(
            {
                success:false,
                message:'Sub Section Not Exisits'
            }
        ))
    }

    
    // Check if subsection exists or not
    if(!courseProgress)
        {
            return(res.json(400).json(
                {
                    success:false,
                    message:'Course Progress Not Exisits'
                }
            ))
        }

    // Check if That lecture is already marked as completed or not
    if(courseProgress?.completedVideos?.includes(subSectionId))
    {
        return(res.status(400).json(
            {
                successs:false,
                message:'Video already marked as complete'
            }
        ))
    }

    // Now add the subSection Id inside the arrayS
    const updatedCourseProgress = await CourseProgress.findOneAndUpdate(
        {_id:courseProgress._id},
        {
            courses:courseId,
            $push:{completedVideos:subSectionId}
        },
        {new:true}
    )

    console.log("Updated Course Progress  = " , updatedCourseProgress);

    return(res.status(200).json(
        {
            success:true,
            message:'Video Marked as Completed',
            body:updatedCourseProgress
        }
    ))
        
    } catch (error) {

        return(res.status(400).json(
            {
                success:false,
                message:error.message,
                error:error
            }
        ))
        
    }
    
}

module.exports = {
    updateCourseProgress
}