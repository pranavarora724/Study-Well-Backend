
const cloudinary = require('cloudinary').v2;

async function imageDelete(public_id)
{
    await cloudinary.uploader.destroy(public_id);

}

module.exports = imageDelete;