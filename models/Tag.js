
const mongoose = require('mongoose');

// One course can have many tags
//  Oe tag can have many courses
// Many to many

const tagSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },

        description:{
            type:String,
        },

        courses:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }]
    }
);

const Tag = mongoose.model("Tag" , tagSchema);
module.exports = Tag;