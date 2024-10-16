
const instance = require( '../config/razorpay');
const User = require('../models/User');
const Course = require('../models/Course');
const sendMail = require('../config/emailSender');
const mongoose = require('mongoose');
const courseEnrollmentTemplate = require('../mailTemplates/courseEnrollmentTemplate');
const emailSender = require('../config/emailSender');
// import crypto from 'crypto'
const CourseProgress = require('../models/CourseProgress');
const crypto = require('crypto');

// We create 2 constrollers
// 1 - To create an order via instance
// So first get the array of courses
// Then get the user id of logged in user
// Perform validations
// Calculate total Amount and check if already purchasesd course or not 
// Create orer after calculatig total amount and return order

async function capturePayment(req , res)
{
    const {courses} = req.body;
    const user = req.userDetails.id;
    console.log(req.body);

    try {

        
    if(!courses)
        {
            return(res.status(400).json(
                {
                    success:false,
                    message:'Couses not available'
                }
            ))
        }

        let totalAmount = 0;
console.log("COURSES + " + courses[0]);

    //    courses.forEach( async(courseId) => {
        for(let courseId of courses)    
        {
            // Get course info
            const courseDetails = await Course.findOne(
                {_id:courseId}
            ) 
            if(!courseDetails)
            {
                return res.status(400).json(
                    {
                        success:false,
                        message:'No course exisitng'
                    }
                )
            }
            const uid = new mongoose.Types.ObjectId(user);

            if(courseDetails.studentsEnrolled.includes(uid))
            {
                return(res.status(400).json(
                    {
                        success:false,
                        message:'Student already enrolled in course'
                    }
                ))
            }
            // console.log("courseDetails =  ," , courseDetails);

            totalAmount = totalAmount + Number(courseDetails.price);
            console.log("Total amoint in loop" , totalAmount);
            // Check if user is enrooleed o not
            
        };

        console.log("Total amount ouside loop = " , totalAmount);
        var options = {
            amount: totalAmount*100,  // amount in the smallest currency unit
            currency: "INR",
          };
          
          console.log("=options = " , options) 

        let paymentResponse;
         paymentResponse = await instance.orders.create(options);

          return(res.status(200).json(
            {
                success:true,
                body:paymentResponse,
                message:'Order created successfully'
            }
          ))
        
    } catch (error) {
        console.log("Error = " , error);
        console.log(error.error);
        return(res.status(400).json(
            {
                success:false,
                message:error.message,
                data:'Error in capturing payment'
            }
        ))
        
    }
}

async function giveTotalAmount()
{

}


// Now verify the payment
// We get 3 things returned from Razorpay
// Encode them and verify the payment
// After vverifyng the payment update the backend
// Add enrolledStudents array and update purchased_courses array 

async function verifySignature(req , res)
{

    try {

        
    console.log(req.body);
    const {razorpay_payment_id , razorpay_order_id , razorpay_signature , courses} = req.body;
    // console.log(req.body.)
    console.log("Payment id = ",razorpay_payment_id);
    console.log("Order id = ",razorpay_order_id);
    console.log("Payment Signature = ",razorpay_signature);
    console.log("Courses =  " , courses);

    const userId = req.userDetails.id;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses)
    {
        return(res.status(400).json(
            {
                success:false,
                message:'Details misiing'
            }
        ))
    }

    var generatedSignature = crypto.createHmac(
      "SHA256",
      process.env.RAZORPAY_SECRET
    )
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");  


    console.log("Generated Sinature" , generatedSignature);
    console.log("Razorpay Signature" , razorpay_signature);

    if(generatedSignature == razorpay_signature)
    {
        // It means ki now are payment is verified now uodate user and course schemas
        for(const courseId of courses)
        {
            const updatedCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true}
            );

            const updatedUser = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true}
            )

            // Now create a course progress entry in database
            const createdProgress = await CourseProgress.create(
                {
                    courseId:courseId,
                    completedVideos:[],
                    userId:userId
                }
            );

            // Now send mail to studemts for getting enrolled in course
            const mailTemplate = courseEnrollmentTemplate(updatedCourse?.name , updatedUser.firstName);
            
            const emailResponse = await emailSender(updatedUser.email , 
                `Successfully enrolled in ${updatedCourse.name}`,
                mailTemplate
            )
            console.log("Email resonse " , emailResponse);
        }
    }

    return(res.status(200).json(
        {
            success:true,
            message:'Enrolled Successfully in course'
        }
    ))
        
    } catch (error) {
        
        console.log(error.message);
        return(res.status(400).json(
            {
                success:false,
                message:error.message
            }
        ))
    }

}

async function getApiKey(req, res)
{
    try {

        return(res.status(200).json(
            {
                success:true,
                key:`${process.env.RAZORPAY_KEY}`
            }
        ))
        
    } catch (error) {

        return(res.staus(400).json(
            {
                success:false,
                message:'Cannot get api key'
            }
        ))
        
    }
}

module.exports = {
    capturePayment , 
    verifySignature ,
    getApiKey
}