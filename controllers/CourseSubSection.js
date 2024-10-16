

const CourseSubSection = require('../models/CourseSubSection');
const CourseSection = require('../models/CourseSection');

const imageUploader = require('../utils/imageUploader');
const imageDelete = require('../utils/imageDelete');
const Course = require('../models/Course');

// Create 3 controllers Create Upddatw Delete
// Take the inputs
// Perform vslidations

// Update CourseSection Schema by adding CourseSubSection id there


async function addSubSection(req , res)
{
    try {

        const {title , description , section_id} = req.body;

        if(!title || !description  || !section_id)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:'Enter all the fields'
                }
            )
        }
    
        const uploadedFile = req.files.videoFile;
        const videoObject = req.body.videoObject;

        console.log("VideoObject = " , videoObject);
    
        const supportedTypes = ["mp4" , "mov"]
    
        if(isFileTypeSupported(uploadedFile.name , supportedTypes) == false)
        {
            return res.status(401).json({
                success:false,
                message:"File type is not supported"
            })
        }
    
        const fileSizeinMB = uploadedFile.size/(1024*1024);
        console.log("File size in mb = ",fileSizeinMB);
    
        if(fileSizeinMB>=5)
        {
            return res.status(402).json(
                {
                    success:false,
                    message:"File too huge"
                }
            )
        }
    
        console.log("Uploading to StudyNotion folder");
        const response =  await imageUploader(uploadedFile , "StudyNotion");
        console.log("Response = " , response); 
    
        const addedSubSection = await CourseSubSection.create(
            {
                title:title,
                description:description,
                videoUrl:response.secure_url,
                videoObject:videoObject,
                section_id:section_id,
                public_id:response.public_id
            }
        )


        // Now updating section schema

        const updatedSection = await CourseSection.findOneAndUpdate(
            {_id:section_id},
            {$push:{subSection:addedSubSection._id}},
            {new:true}
        );
        const courseId = updatedSection.course_id;

        const existingCourse = await Course.findOne({_id:courseId})
        .populate({path:'courseContent' , 
            populate:{
                path:'subSection'
            }
        }).exec();

        return res.status(200).json(
            {
                success:true,
                message:' section added successfully',
                body:existingCourse
            }
        )
    
        
    } catch (error) {

        return res.status(500).json(
            {
                success:false,
                message:error.message,
                body:'Error in creating subSection'
            }
        )
        
    }
}

async function updateSubSection(req , res)
{
    try {

        const {title , description ,  subSection_id , videoObject} = req.body;

        if(!title || !description ||  !subSection_id)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:'Enter all the fields'
                }
            )
        }

        const subSectionDeleted = await CourseSubSection.findOne({_id:subSection_id});
        const public_id = subSectionDeleted.public_id;
        
        await imageDelete(public_id);
    
        const uploadedFile = req.files.videoFile;
    
        const supportedTypes = ["mp4" , "mov"]
    
        if(isFileTypeSupported(uploadedFile.name , supportedTypes) == false)
        {
            return res.status(401).json({
                success:false,
                message:"File type is not supported"
            })
        }
    
        const fileSizeinMB = uploadedFile.size/(1024*1024);
        console.log("File size in mb = ",fileSizeinMB);
    
        if(fileSizeinMB>=5)
        {
            return res.status(402).json(
                {
                    success:false,
                    message:"File too huge"
                }
            )
        }
    
        console.log("Uploading to StudyNotion folder");
        const response =  await imageUploader(uploadedFile , "StudyNotion");
        console.log("Response = " , response); 


        const updatedSubSection = await CourseSubSection.findOneAndUpdate(
            {_id:subSection_id},
            {
                title:title,
                description:description,
                videoUrl:response.secure_url,
                public_id:response.public_id,
                videoObject:videoObject
            },
            {new:true}
        )

        const section_id = updatedSubSection.section_id;
        const exisitngSection = await CourseSection.findOne({_id:section_id});

        const course_id = exisitngSection.course_id;
        const existingCourse = await Course.findOne({_id:course_id})
        .populate({path:'courseContent' , 
            populate:{
                path:'subSection'
            }
        }).exec();

        

        return res.status(200).json(
            {
                success:true,
                message:'Sub Section updated Successfully',
                body:existingCourse
            }
        )
    

    } catch (error) {
        
        return res.status(500).json(
            {
                success:false,
                message:error.message,
                body:'error in updating Sub section'
            }
        )
    }
}


async function deleteSubSection(req , res){

    try {

        const subSectionId = req.query.id;
        
        const subSectionDeleted = await CourseSubSection.findOne({_id:subSectionId});

        const section_id = subSectionDeleted.section_id;

        const updatedSection = await CourseSection.findOneAndUpdate(
            {_id:section_id},
            {$pull:{subSection:subSectionId}},
            {new:true}
        )

        await CourseSubSection.findOneAndDelete({_id:subSectionId});

        const courseId = updatedSection.course_id;

        const existingCourse = await Course.findOne({_id:courseId})
        .populate({path:'courseContent' , 
            populate:{
                path:'subSection'
            }
        }).exec();

        return res.status(200).json(
            {
            success:true,
            message:'Sub Section successfully deleted',
            body:existingCourse
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



function isFileTypeSupported(filename , supportedTypes)
{
    console.log("FILENAME = ", filename);
    const x = filename.lastIndexOf(".");
    const type = filename.substring(x+1);
    console.log("File type = " , type);

    return supportedTypes.includes(type);
}


module.exports={
    addSubSection,
    updateSubSection,
    deleteSubSection
};