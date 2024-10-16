
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        firstName:{
            type:String,
            required:true,
            trim:true
        },

        lastName:{
            type:String,
            required:true,
            trim:true
        },

        email:{
            type:String,
            required:true,
            trim:true
        },

        password:{
            type:String,
            required:true,
        },

        confirmPassword:{
            type:String,
            required:true,
        },

        accountType:{
            type:String,
            required:true,
            enum:["Student" , "Instructor" , "Admin"]
        },

        profile:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Profile"
        },

        courses:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }],

        courseProgress:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress"
        }],

        imageUrl:{
            type:String
        },

// Helpful while deleting The old proile pic
        imagePublicId:{
            type:String,
            default:null
        },

        token:{
            type:String
        },
        tokenExpiresIn:{
            type:Date
        }
    }
)


const User = mongoose.model("User" , userSchema);
module.exports = User;