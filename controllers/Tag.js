
const Tag = require('../models/Tag');

// 1- Write Create Tag Controllers
// 2 - Not add Course it will be added later
// 3 - Only Admin has Right of Creating Tags
// 4 - Now create a ShowTags controler

async function createTag(req , res)
{
    try {

        const name = req.body.name;
        const description = req.body.description;
    
        if(!name , !description)
        {
            return res.status(401).json(
                {
                success:false,
                message:"Fill all feilds"
                }
            )}
    
            const existingTag = Tag.find(
                {name:name}
            )
    
            if(existingTag)
            {
                return res.status(401).json({
                    success:false,
                    message:"Tag already exisits"
                })
            }
        
        const newTag = {
            name:name,
            description:description
        };
    
        const savedTag = await Tag.save(newTag);
    
        return res.status(200).json(
            {
                success:true,
                message:"Tag Create Successfully"
            }
        )

    } catch (error) {
        
        return res.status(401).json({
            success:false,
            message:error
        })
    }

    }


async function getTags(req , res)
{
    const allTags = Tag.find({});

    return res.status(200).json({
        success:true,
        message:"Tags are",
        body:allTags
    })
}


module.exports = {
    createTag,
    getTags
}