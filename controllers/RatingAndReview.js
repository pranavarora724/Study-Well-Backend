
const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');


// Create 3 functions
//  1 - to create a review and raing
//  2 - To Get all the ratings and reviews
//  3 - To get the avg of all ratings to be displayed there


// Create a Reviw
// Fetch courseId , rating , review 
// Perform validations
// Check if user is enroled for course or not,
// Check if user has already written a review
async function createReviewAndRating(req , res)
{
    try {

        const userId = req.userDetails.id;
        const courseId = req.body.courseId;
        const rating = req.body.rating;
        const review = req.body.review;

        if(!courseId || !rating || !review)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:'Fill all the fileds'
                }
            )
        } 

        
        const existingCourse = await Course.findOne({_id:courseId});
        if(!existingCourse)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:"Invalid course id"
                }
            )
        }

        // Check if a review for a course is already submiitted or not
        const existingReview =await RatingAndReview.findOne(
            {
                userId:userId,
                courseId:courseId
            }
        )

        if(existingReview)
        {
            return (res.status(400).json(
                {
                    success:false,
                    message:'Allowed only One review for a Course'
                }
            ))
        }

        // const uid = new mongoose.Schema.Types.ObjectId(userId);

        // Onl allowed to write review if you are enrolled for the course
        const uid = new mongoose.Types.ObjectId(userId);
        const studentsEnrolled = existingCourse.studentsEnrolled;
        if(studentsEnrolled.includes(uid))
        {
            const newRatingAndReview = await RatingAndReview.create(
                {
                    userId:userId,
                    courseId:courseId,
                    rating:rating,
                    review:review
                }
            )
        
            const updatedCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{ratingAndReviews:newRatingAndReview._id}},
                {new:true}
            )

            return res.status(200).json(
                {
                    success:true,
                    message:'Rating and reveiw is Created',
                    body:newRatingAndReview
                }
            )
        }

        else{
            // Student is not enrolled for the course

            return res.status(400).json(
                {
                    success:false,
                    message:'Student is not enrolled for course cannot write review'
                }
            )
        }
    
        
        
    } catch (error) {

        return res.status(400).json(
            {
                success:false,
                message:error.message
            }
        )
        
    }
}


// Now create a controller too get all the reviews of  a course
async function getAllReviewsAndRtingsOfACourse(req , res)
{

    try {

        const courseId = req.body.courseId;

    if(!courseId)
    {
        return res.status(400).json(
            {
                success:false,
                message:'Fill all the fileds'
            }
        )
    } 

    const existingCourse = await Course.findOne({_id:courseId});
    if(!existingCourse)
    {
        return res.status(400).json(
            {
                success:false,
                message:"Invalid course id"
            }
        )
    }

        const reviews = await RatingAndReview.find({courseId:courseId})
                                        .sort({rating:"desc"})
                                        .populate({path:"userId"  , select:"firstName"})
                                        .exec();

    return res.status(200).json(
        {
            success:true,
            message:'Reviews are',
            body:reviews
        }
    )

        
    } catch (error) {
        return res.status(400).json(
            {
                success:false,
                message:error.message
            }
        )
    }
}

// CReate handler funcction to gwet All the past rating and reviews
async function getAllRatingsAndReviews(req , res)
{
    try {

        const Reviews = await RatingAndReview.find({})
                                      .populate({path:'courseId'})
                                    .populate({path:'userId'})
                                    .exec(); 


        return res.status(200).json(
            {
                success:true,
                message:'Reviews are',
                Reviews:Reviews
            }
        )
        
    } catch (error) {

        return res.status(400).json(
            {
                success:false,
                message:error.message
            }
        )
        
    }
}

// Now creatre a handler function to AVERAGE RATINGS
// Used 'AGGREGATE' function
async function getAverageRatings(req , res)
{
    
  try {

    const courseId = req.body.courseId;

    if(!courseId)
    {
        return res.status(400).json(
            {
                success:false,
                message:'Fill all the fileds'
            }
        )
    } 

    const existingCourse = await Course.findById({courseId});
    if(!existingCourse)
    {
        return res.status(400).json(
            {
                success:false,
                message:"Invalid course id"
            }
        )
    }


    // Now find aggregate RATINGS by aGGREGATE FUNCTION
    const cid = new mongoose.Types.ObjectId(courseId);

    const Rating = await RatingAndReview.aggregate(
        [
            {
                // Filter out ALL Reviews on basis of courseId
                $match:{courseId:cid},
                // Group them then and avg Ratings
                $group:{_id:null    ,    avgRating:{$avg :"$rating"} }
            }
        ]
    )

    console.log("Rating = " , Rating);
    // It will contain an array of objecrs
    // In this case will return array of length 1
    // So ans is 'Rating[0].length' 

    if(Rating.length>0)
    {
        // Rating mili hai
        return res.status(200).json(
            {
                success:true,
                message:'Avg rating is',
        //  Aggregate function returns an array of objects
        // So ANS is stored in first elemnt of array ke 'avgRating' ke anddar
                Rating:Rating[0].avgRating
            }
        )
    }
    else{
        // Course is unrated
        return res.status(200),json(
            {
                success:true,
                message:'Avg rating is',
                Rating:0
            }
        )
    }
  
    
  } catch (error) {
    return res.status(400).json(
        {
            success:false,
            message:error.message
        }
    )
  }  
}


module.exports = {
    createReviewAndRating,
    getAllReviewsAndRtingsOfACourse,
    getAllRatingsAndReviews,
    getAverageRatings
}