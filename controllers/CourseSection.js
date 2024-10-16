
const Course = require('../models/Course');
const CourseSection = require('../models/CourseSection');
const CourseSubSection = require('../models/CourseSubSection');
const imageDelete = require('../utils/imageDelete');

// Create 3 controllers add , update , delete
// Fetch all the values from req.body
// Perform Validation
// Create a section and store in database
// Update course schema by updating values 


async function addSection(req , res)
{
    try {

        const {name , course_id} = req.body;
    
    if(!name || !course_id)
    {
        return res.status(400).json(
            {
                success:false,
                message:'Fill all fields'
            }
        )
    }

    const newSection =  await CourseSection.create(
        {
            sectionName:name,
            course_id:course_id
        }
    )

    console.log("Neew Section = ", newSection);


    // const addedSection = await newSection.save(newSection);

   const updatedCourse =await  Course.findOneAndUpdate(
        {_id:course_id},
        {$push: {courseContent: newSection._id} },
        {new:true}
   ).populate({path:'courseContent' , 
        populate:{
            path:'subSection'
        }
    }).exec();

    console.log("Updated Course = " , updatedCourse);
    

    return res.status(200).json(
        {
            success:true,
            message:'Section added successfully',
            body:updatedCourse
        }
    )
    
        
    } catch (error) {
        
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}



async function updateSection(req , res)
{
    try {

        const {name , section_id} = req.body;

    if(!name , !section_id)
    {
        return res.status(400).json(
            {
                success:false,
                message:'Fill all the fields'
            }
        )
    }

    const updatedSection = await CourseSection.findOneAndUpdate(
        {_id:section_id},
        {sectionName:name},
        {new:true}
    )

    const courseId = updatedSection.course_id;

    const updatedCourse = await Course.findOne(
        {_id:courseId}
    ).populate({path:'courseContent' , 
        populate:{
            path:'subSection'
        }
    }).exec();


    return res.status(200).json(
        {
            success:true,
            message:'Successfully updated' ,
            body:updatedCourse       
        }
    )
    
        
    } catch (error) {
        
        return res.status(400).json(
            {
                success:false,
                error:error.message
            }
        )
    }
}


//  Get the sectionId to be deleted in Params
//  Remove that sectionId from course Id
//  Delete all the subsctions involved in that section

async function deleteSection(req , res)
{
    try {

        const section_id = req.query.id;
        console.log("Section Id = " , section_id);

        const sectionToBeDeleted = await CourseSection.findOne({_id:section_id});
        const course_id = sectionToBeDeleted.course_id;

        const updatedCourse =await Course.findOneAndUpdate(
            {_id:course_id},
            {$pull:{courseContent:section_id}},
            {new:true}
        ).populate({path:'courseContent' , 
            populate:{
                path:'subSection'
            }
        }).exec();

        console.log("Updated Course = " , updatedCourse);

        const subSections = sectionToBeDeleted.subSection;
        
        if(subSections)
        {
            subSections.forEach( async(eachSubSection)=>{
            
                const subSectionDeleted = await CourseSubSection.findById({eachSubSection});
                const public_id = subSectionDeleted.public_id;
                await imageDelete(public_id);
        
                await CourseSubSection.findOneAndDelete({_id:eachSubSection});
                } )
        }

       await CourseSection.findOneAndDelete({_id:section_id});

        return res.status(200).json(
            {
                success:true,
                message:'Course section successfully deleted',
                body:updatedCourse
            }
        )
        
    } catch (error) {

        return res.status(500).json({
            success:false,
            message:error.message,
            body:'Error whole deleting section'
        })
        
    }
}


module.exports = {
    addSection , 
    updateSection , 
    deleteSection
}