

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
    {
        gender:{
            type:String,
            enum:["Male" , "Female" , "Others"]
        },

        about:{
            type:String,
        },

        dob:{
            type:String
        },

        contactNumber:{
            type:String
        },

    }
)

const Profile = mongoose.model("Profile" , profileSchema);
module.exports = Profile;