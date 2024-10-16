
const mongoose = require('mongoose');
// const sendmail = require("../config/emailSender");
const sendMail = require('../config/emailSender');
const optTemplate = require('../mailTemplates/otpTemplate');
const otpTemplate = require('../mailTemplates/otpTemplate');

const otpSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required:true
        },

        otp:{
            type:String,
            required:true
        },

        // deletes document 5 minutes later
        // expireAt: {
        //     type: Date,
        //     default: Date.now,
        //     expires: 60*5,
        // }
    },
    {
        timestamps:true
    }
);


otpSchema.index( {createdAt:1} ,{expireAfterSeconds:(60*5) });


// PRE Middleware
otpSchema.pre("save" , async function(next){

    await sendVerificationEmail(this.email , this.otp);   //we use await to call async function
    next();
});



// Function to send mail
async function sendVerificationEmail(email , otp)
{
    try {
        
        // this.email and this.otp sends the current value which is going to be stored in database
        const mailBody = otpTemplate(otp);
       let info =  await sendMail(email , "OTP verification of Email" , mailBody);
       console.log(info);
        
    } catch (error) {
        
        console.log(error);
        process.exit(1);
    }
}

const OTP = mongoose.model("OTP" , otpSchema);
module.exports = OTP;