

const Profile = require('../models/Profile');
const User = require('../models/User');
const Course = require('../models/Course');
const imageUploader = require('../utils/imageUploader');
const imageDelete = require('../utils/imageDelete');
const mongoose = require('mongoose');


// Take input from the Of all the fields
// Perform all the validations
// Finfd profile id from user 
// Update the profile as we have already created during USer creation


async function updateProfile(req , res)
{
    try {

        const gender = req.body.gender;
    const dob = req.body.dob;
    const about = req.body.about;
    const contactNumber = req.body.contactNumber;
    const firstName = req.body.firstName;
    const secondName = req.body.lastName;

    console.log("About  = " , about);

    const userId = req.userDetails.id;
    const uid = new mongoose.Types.ObjectId(userId);

    const existingUser  = await User.findOne(
                                            {_id:uid}
                                            );
    console.log("Existing User = " , existingUser);
    
    const profileId = existingUser.profile;
    
    // const pid = new mongoose.Types.ObjectId(profileId);

    const profileObject = await Profile.findOneAndUpdate(
        {_id:profileId},
        {
        gender:gender,
        dob:dob,
        about:about,
        contactNumber:contactNumber
    },
    {new:true}
    );

    const updatedUser = await User.findOneAndUpdate(
        {_id:uid},
        {
            firstName:firstName,
            lastName:secondName
        },
        {new:true}
    ).populate('profile')
    .exec();

    console.log("PofileObject = " , profileObject);


    return res.status(200).json({
        success:true,
        message:'Profile Successfullty updated',
        profile:profileObject,
        user:updatedUser
    })
        
    } catch (error) {
      
        console.log(error.message);
        return res.status(500).json(
            {
                sucess:false,
                message:"Error in updating Profile",
                error: error.message
            }
        )
    }
}


async function deleteAccount(req , res)
{
  try {

    const userId = req.userDetails.id;
    const uid = new mongoose.Types.ObjectId(userId);

    const existingUser = await User.findOne(
                                             {_id:uid}
                                            );
    const profileId = existingUser.profile;
    const coursesId = existingUser.courses;

    await Profile.findByIdAndDelete({profileId});

    // If sudent remove that student's id from courses he was enrolled
    if(existingUser.accountType === "Student")
    {
        coursesId.forEach( async(singleCourse)=>{
            const updatedCourse = await Course.findByIdAndUpdate(
                {singleCourse},
                {$pull:{studentsEnrolled:userId}},
                {new:true}
            )
        } )
    }
    
    // If instructor delete all courses created by instructor
    if(existingUser.accountType === "Instructor")
    {
        coursesId.forEach( async(singleCourse)=>{
            await Course.findByIdAndDelete({singleCourse})
        } )
    }

    await User.findOneAndDelete(
                                {_id:uid}
                               );

    return res.status(200).json(
        {
            success:true,
            message:'User Successfuly deleted'
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


async function getProfile( req , res)
{
    try {

        
    const userId = req.userDetails.id;
    const uid = new mongoose.Types.ObjectId(userId);

    const profile = await User.findOne({_id:uid})
                                .populate("profile")
                                .populate({
                                    path:"courses",
                                    populate:{
                                        path:"ratingAndReviews"
                                    },
                                })
                                .exec();

    console.log("Profile  = " , profile);
    
    if(!profile)
    {
        return res.status(401).json(
            {
                success:false,
                message:'Invalid profile id'
            }
        )
    }

    return res.status(200).json(
        {
            success:true,
            message:"Profile is ",
            body:profile
        }
    )
        
    } catch (error) {

        return res.status(500).json(
            {
                success:false,
                message:error.message,
                body:'erro while displaying profile'
            }
        )
        
    }
}

// Controller to upate profile pic 
async function updateProfilePic(req , res)
{
    try {

        

    // If profile pic is not set to null 
    // Matlab vo ek baar already upoased hai cloudinar ype
    // Ou duty is to delete the old profile pic from cloudinary FIRST

    const userId = req.userDetails.id;

    const uid = new mongoose.Types.ObjectId(userId);

    const existingUser = await User.findOne({_id:uid});
    if(existingUser.imagePublicId != null)
    {
        // NOW delete old profile pic
        const public_id = existingUser.imagePublicId;
        await imageDelete(public_id);
    }

    console.log("Fetching Profle Pic");
    const uploadedFile = req.files.profilePic;
    console.log("Uploaded file = " , uploadedFile);
    const supportedTypes = ["jpg" , "jpeg" , "png"]

    if(isFileTypeSupported(uploadedFile.name , supportedTypes) == false)
    {
        return res.status(401).json({
            success:false,
            message:"File type is not supported"
        })
    }

    const fileSizeinMB = uploadedFile.size/(1024*1024);
    console.log("File size in mb = ",fileSizeinMB);

    if(fileSizeinMB>=1)
    {
        return res.status(402).json(
            {
                success:false,
                message:"Image too huge"
            }
        )
    }

    console.log("Uploading to StudyNotion folder");
    const response =  await imageUploader(uploadedFile , "StudyNotion");
    console.log("Response = " , response); 

    const updatedUser = await User.findOneAndUpdate(
                                                  {_id:uid} , 
                                                  {
                                                    imageUrl:response.secure_url ,
                                                    imagePublicId:response.public_id
                                                  },
                                                  {new:true}
                                                  ).populate("profile").exec();

    return res.status(200).json({
        success:true,
        message:'profile pic Successfully updated',
        body:updatedUser
    })
        
    } catch (error) {

        return res.status(500).json(
            {
                success:false,
                message:error.message,
                body:'error in updating profie pic'
            }
        )
        
    }
}

async function getInstructorDashboard(req,res)
{
    const instructorId = req.body.instructorId;

    if(!instructorId)
    {
        return(res.status(400).json(
            {
                success:false,
                message:'Instructor id not present'
            }
        ))
    }

    const instructorCourses = await Course.find(
        {instructor:instructorId}
    )

    const instructorData = instructorCourses.map((course , index)=>{
        const data={
            _id:course._id,
            courseName:course.name,
            studentsEnrolled:course.studentsEnrolled.length,
            moneyEarned:course.studentsEnrolled.length * course.price
        }

        return data;
    })
    res.status(200).json(
        {
            success:true,
            data:instructorData
        }
    )
}

module.exports = {
    updateProfile,
    deleteAccount,
    getProfile , 
    updateProfilePic,
    getInstructorDashboard
}

function isFileTypeSupported(filename , supportedTypes)
{
    console.log("FILENAME = ", filename);
    const x = filename.lastIndexOf(".");
    const type = filename.substring(x+1);
    console.log("File type = " , type);

    return supportedTypes.includes(type);
}