
const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const mongoose = require('mongoose');
const imageUploader = require('../utils/imageUploader');
const CourseProgress = require('../models/CourseProgress');

// 1 - We needd to Create Courses
// 2 - Get all the requied details from the frontend
// 3 - Perform Validations
// 4 - Fetch USer ki id from req.user as stored earlier in middlewares "isValid"
// 5 - Add the course id in user
// 6 - Fetch Tag from id and the created course in tag 


async function createCourse(req, res) {
    try {

        const {
            name,
            description,
            price,
            tag,
            category,
            whatWillYouLearn,
            instructions
        } = req.body;

        const tagArray = JSON.parse(tag);
        const instructionsArray = JSON.parse(instructions);

        //   console.log("NAME + ", name);
        //   console.log("desc + ", description);
        //   console.log("price + ", price);
        //   console.log("tag + ", tagArray);
        //   console.log("whatwilllearn + ", whatWillYouLearn);
        //   console.log("category + ", category);
        // const uploadedFile2 = req.files.thumbnailImage;
        // console.log("Uploaded file 2 =" , uploadedFile2);


        //   Vaidations on course data
        if (!name || !description || !price || !tag || !whatWillYouLearn || !category) {
            return res.status(401).json(
                {
                    success: false,
                    message: "Fill all the required fileds"
                }
            )
        }

        //   VAlidations on course data
        const existingCourse = await Course.findOne(
            { name: name }
        )

        console.log("Existing course = ", existingCourse);

        if (existingCourse) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Course with same already exisists"
                }
            )
        }

        //   Validations on Uploaded image


        const uploadedFile = req.files.thumbnailImage;

        console.log("Uploaded File = ", uploadedFile);
        const supportedTypes = ["jpg", "jpeg", "png"]

        if (isFileTypeSupported(uploadedFile.name, supportedTypes) == false) {
            return res.status(401).json({
                success: false,
                message: "File type is not supported"
            })
        }

        const fileSizeinMB = uploadedFile.size / (1024 * 1024);
        console.log("File size in mb = ", fileSizeinMB);

        if (fileSizeinMB >= 1) {
            return res.status(402).json(
                {
                    success: false,
                    message: "Image too huge"
                }
            )
        }

        console.log("Uploading to StudyNotion folder");
        const response = await imageUploader(uploadedFile, "StudyNotion");
        console.log("Response = ", response);


        // aFTER performing all the validations
        console.log("USer details");
        console.log("User details = ", req.userDetails);
        const userId = req.userDetails.id;
        console.log(userId);
        const id = new mongoose.Types.ObjectId(userId);
        console.log(id);
        // Uploading Course
        const uploadedCourse = await Course.create(
            {
                name: name,
                description: description,
                instructor: userId,
                whatWillYouLearn: whatWillYouLearn,
                price: price,
                thumbnail: response.secure_url,
                tag: tagArray,
                category: category,
                instructions: instructionsArray,
                status: "Draft"
            }
        );

        console.log("Uploaded course = ", uploadedCourse);

        // Update User and Tag and Category Schema by adding this course in it

        const updatedUser = await User.findOneAndUpdate(
            { _id: id },
            { $push: { courses: uploadedCourse._id } },
            { new: true }
        );

        const catId = new mongoose.Types.ObjectId(category);

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: catId },
            { $push: { courses: uploadedCourse._id } },
            { new: true }
        );


        // We will recerive an array of tags 
        // So har tag ke schema k andar update course id

        // tag.forEach( async(singleTag , index) =>{
        //     const updatedTag = await Tag.findByIdAndUpdate(
        //         {singleTag},
        //         {$push:{courses:uploadedCourse._id}},
        //         {new:true}
        //     )
        // } );


        return res.status(200).json(
            {
                success: true,
                message: 'Course created successfully',
                body: uploadedCourse
            }
        )

    } catch (error) {

        return res.status(500).json(
            {
                success: false,
                message: error.message,
            }
        )
    }

}

async function updateCourse(req , res)
{
    try {

        const {
            course_id,
            name,
            description,
            price,
            tag,
            // category,
            whatWillYouLearn,
            instructions,
            status
        } = req.body;

        const tagArray = JSON.parse(tag);
        const instructionsArray = JSON.parse(instructions);

     

        //   Vaidations on course data
        if (!name || !description || !price || !tag || !whatWillYouLearn) {
            return res.status(401).json(
                {
                    success: false,
                    message: "Fill all the required fileds"
                }
            )
        }
     
        // aFTER performing all the validations
        console.log("USer details");
        console.log("User details = ", req.userDetails);
        const userId = req.userDetails.id;
        console.log(userId);
        const id = new mongoose.Types.ObjectId(userId);
        console.log(id);
        // Uploading Course
        console.log("course_id = " , course_id);
        const uploadedCourse = await Course.findOneAndUpdate(
            {_id:course_id},
            {
                name: name,
                description: description,
                // instructor: userId,
                whatWillYouLearn: whatWillYouLearn,
                price: price,
                // thumbnail: response.secure_url,
                tag: tagArray,
                // category: category,
                instructions: instructionsArray,
                status: status
            },
            {new:true}
        );

        console.log("Uploaded course = ", uploadedCourse);

        



        // We will recerive an array of tags 
        // So har tag ke schema k andar update course id

        // tag.forEach( async(singleTag , index) =>{
        //     const updatedTag = await Tag.findByIdAndUpdate(
        //         {singleTag},
        //         {$push:{courses:uploadedCourse._id}},
        //         {new:true}
        //     )
        // } );


        return res.status(200).json(
            {
                success: true,
                message: 'Course created successfully',
                body: uploadedCourse
            }
        )

    } catch (error) {

        return res.status(500).json(
            {
                success: false,
                message: error.message,
            }
        )
    }
}

// Create controller for Shwoing all courses lists

async function getAllCourses(req, res) {
    try {

        const allCourses = await Course.find({});
        console.log("All courses = ", allCourses);

        return res.status(200).json(
            {
                success: true,
                message: 'All courses are',
                body: allCourses
            }
        )

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


// Get single course by pouating all the fields
// No object id should be present 
async function getSingleCourse(req, res) {
    try {

        const courseId = req.body.courseId;
        console.log("Course id " , courseId);
        

        const existingCourse = await Course.findOne({ _id: courseId })
            .populate({path:'instructor'})
            // .populate({ path: "studentsEnrolled"})
            .populate({ path: "tag", select: "name" })
            // .populate({ path: "category", select: "name -_id" })
            .populate({ path: "ratingAndReviews", select: "reveiw" })
            .populate({path:'courseContent' , 
                populate:{
                    path:'subSection'
                }
            })
            .exec();

            console.log("existing response" , existingCourse);

            
        return res.status(200).json(
            {
                success: true,
                message: 'Course details are',
                body: existingCourse,
                // courseProgress:(courseProgress)?(courseProgress?.completedVideos):([])
            }
        )

    } catch (error) {

        return res.status(500).json(
            {
                success: false,
                message: error.message,
                body: 'error in displaying course'
            }
        )
    }

}

async function getSingleCourseWithProgress(req , res)
{
    
        try {

            const courseId = req.body.courseId;
            const userId = req.userDetails.id;
            console.log("Course id " , courseId);
            
    
            const existingCourse = await Course.findOne({ _id: courseId })
                .populate({path:'instructor'})
                // .populate({ path: "studentsEnrolled"})
                .populate({ path: "tag", select: "name" })
                .populate({ path: "ratingAndReviews"})
                .populate({path:'courseContent' , 
                    populate:{
                        path:'subSection'
                    }
                })
                // .populate('category')
                .exec();
    
                console.log("existing response" , existingCourse);

                const userCourseProgress = await CourseProgress.findOne(
                    {
                        userId:userId,
                        courseId:courseId
                    }
                )
                  
            return res.status(200).json(
                {
                    success: true,
                    message: 'Course details are',
                    body: existingCourse,
                    courseProgress:(userCourseProgress)?(userCourseProgress?.completedVideos):([])
                }
            )
    
        } catch (error) {
    
            return res.status(500).json(
                {
                    success: false,
                    message: error.message,
                    body: 'error in displaying course'
                }
            )
        }
}

// Get Onstructor Courses
// async function getIntructorCourses(req, res) {
//     try {

        
//         const {instructor_id
//         } = req.body;
//         console.log(req.body);

//         console.log("Instructor id = " , instructor_id);

//         const publishedCourses = await Course.find(
//             {
                 
//                 // status: "Published",
//                 instructor: instructor_id 
//             },
            
//         )
//         // .populate({
//         //     path: "instructor",
//         //     populate: {
//         //         path: "additionalDetails"
//         //     }
//         // })
//         //     .populate({ path: "studentsEnrolled", select: "name -_id" })
//         //     .populate({ path: "tag", select: "name -_id" })
//         //     .populate({ path: "category", select: "name -_id" })
//         //     .populate({ path: "ratingAndReviews", select: "reveiw -id" })
//         //     .populate({path:'courseContent' , 
//         //         populate:{
//         //             path:'subSection'
//         //         }
//         //     })
//         //     .exec();

//         const draftCourses = await Course.find(
//             {
//                 instructor: instructor_id,
//                 // status: "Draft"
//             },
            
//         )
//         console.log(publishedCourses);
//         console.log(draftCourses);

//         return (res.status(200).json(
//             {
//                 success: "True",
//                 message: "Courses are",
//                 publishedCourses: publishedCourses,
//                 draftCourses: draftCourses
//             }
//         ));

//     } catch (error) {
//         return res.status(500).json(
//             {
//                 success: false,
//                 message: error.message,
//                 body: 'error in displaying course'
//             }
//         )
//     }
// }

async function getIntructorCourses(req , res)
{
    const instructor_id = req.body.instructorId;
    const user_name = req.body.user_name;

   try {

        // console.log(user_name);
    
    const publishedCourses = await Course.find(
        {
            instructor:instructor_id ,
            status:"Published" 
        }
    )
    //  .popualate('instructor')
    //  .populate({ path: "studentsEnrolled", select: "name -_id" })
    //  .populate({ path: "tag", select: "name -_id" })
    //  .populate({ path: "category", select: "name -_id" })
    //  .populate({ path: "ratingAndReviews", select: "reveiw -id" })
    //  .populate({path:'courseContent' , 
    //      populate:{
    //          path:'subSection'
    //      }
    //  })
    //  .exec();

    const draftCourses = await Course.find(
        {
            instructor:instructor_id ,
            status:"Draft" 
        }
    )
    // .popualate('instructor')
    // .populate({ path: "studentsEnrolled", select: "name -_id" })
    // .populate({ path: "tag", select: "name -_id" })
    // .populate({ path: "category", select: "name -_id" })
    // .populate({ path: "ratingAndReviews", select: "reveiw -id" })
    // .populate({path:'courseContent' , 
    //     populate:{
    //         path:'subSection'
    //     }
    // })
    // .exec();

    console.log( "Instructor id" , instructor_id);
    console.log(req.body);
    return res.status(200).json(
        {
            success:true,
            message:"Courses are",
            publishedCourses:publishedCourses,
            draftCourses:draftCourses
        }
    );
    
   } catch (error) {
    
    return res.status(400).json(
        {
            success:false,
            message:error.message
        }
    )
   } 
}

async function publishCourse(req , res)
{
    try {

        const course_id = req.body.course_id;

        const updatedCourse =await Course.findOneAndUpdate(
            {_id:course_id},
            {
                status:"Published"
            },
            {new:true}
        )
        console.log("Published Course = ");
        console.log(updatedCourse);

        return(res.status(200).json(
            {
                success:true,
                message:"Course Published"
            }
        ))
        
    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                message: error.message,
                body: 'error in Publishing course'
            }
        )
    }
}


module.exports = {
    createCourse,
    getAllCourses,
    getSingleCourse,
    getIntructorCourses,
    publishCourse,
    updateCourse,
    getSingleCourseWithProgress
}


function isFileTypeSupported(filename, supportedTypes) {
    console.log("FILENAME = ", filename);
    const x = filename.lastIndexOf(".");
    const type = filename.substring(x + 1);
    console.log("File type = ", type);

    return supportedTypes.includes(type);
}