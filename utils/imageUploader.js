
const cloudinary = require('cloudinary').v2;

async function imageUploader(uploadedFile , folder_name)
{

console.log("Temp file path = ",uploadedFile.tempFilePath)

return await cloudinary.uploader.upload( uploadedFile.tempFilePath , {
    folder:folder_name,
        resource_type:"auto"
});

}

module.exports = imageUploader;