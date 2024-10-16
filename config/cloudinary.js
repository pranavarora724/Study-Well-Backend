
const cloudinary = require('cloudinary').v2;
require("dotenv").config();


 function cloudinaryConnect(req , res)
{
    try {
        
        cloudinary.config(
            {
                cloud_name:process.env.CLOUD_NAME,
                api_key:process.env.API_KEY,
                api_secret:process.env.API_SECRET
            }
        )

        console.log("CLOUDINARY CONNECTION Successfull");
        
    } catch (error) {
        console.log(error);
        console.log("Error while CLOUDINARY CONNECTION");
    }
}

module.exports = cloudinaryConnect;