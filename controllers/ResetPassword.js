
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendMail = require('../config/emailSender');
const bcrypt = require('bcrypt');

// ALGORITHM

// 1 - Get email from req ki body
// 2 - check validations
// 3 - Generate a dummy token for new links everytime
// 4 - Store this frontend link in Database of USER
// 5 - Generae a frontend link jispe they can enter new password 

// 6 - Now create a new controller (Jispe user will enter email , password , confirmPassword) 
// 7 - Do the validtions required
// 8 - Now Through that dumy token access The user from database
// 9-  Hash the password
// 10 - Update with new values

async function ResetPasswordLinkGenerator(req , res)
{
    try {
        
        const email = req.body.email;
        const token = crypto.randomUUID();

        if(!email)
        {
            return res.status(400).json({
                success:false,
                message:"Fill all these details"
            })
        }

        const existingUser = await User.findOne(
            {email:email}
        );

        console.log("Existing User ");
        console.log(existingUser);

        if(existingUser == null)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:"Email is not regsistered"
                }
            )
        }

        const updatedUser = await User.findOneAndUpdate(
                                          {email:email},
                                          {
                                           token:token , 
                                           tokenExpiresIn:Date.now()+5*60*1000
                                          },
                                          {new:true}
        );
        console.log("USer successfully updated");
        console.log("Updated user = ", updatedUser);

         
    const url = `http://localhost:3000/resetPassword/${token}`;

    const info = await sendMail(email , "Link for New Password Generation" , url);

    return res.status(200).json(
        {
            success:true,
            message:'Link sent to your email successfully'
        }
    )

    } catch (error) {
        console.log("Error in ResetPasswordLink Gneration");
        return res.status(400).json(
            {
                success:false,
                message:error
            }
        )
    }

}


async function ResetPassword(req , res)
{
    
    try {

        const {password , confirmPassword , token} = req.body;

    if(!token || !password || !confirmPassword)
    {
        return res.status(401).json(
            {
                success:false,
                message:"Enter all the fields"
            }
        )
    }

    if(password !== confirmPassword)
    {
        return res.status(401).json(
            {
                success:false,
                message:"Entered Password is not as same as Cofirm PAssword"
            }
        )
    }

    const existingUser = await User.findOne(
        {token:token}
    )
    console.log("ExistingUser" , existingUser);

    if(!existingUser)
    {
        return res.status(401).json(
            {
                success:false,
                message:"Invalid Token"
            }
        )
    }

    if(Date.now > existingUser.tokenExpiresIn)
    {
        return res.status(401).json(
            {
                success:false,
                message:"Token Expired"
            }
        )
    }

    let hashedPassword = await bcrypt.hash(password , 10);

    const updatedUser = await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true}
    );

    return res.status(200).json(
        {
            success:true,
            message:"Password Successfully updated",
            body:updatedUser
        }
    )
        
    } catch (error) {
        
        console.log("Error in REserring password");
        return res.status(500).json(
            {
                success:false,
                message:error.message,
                body:'Error while resetting password'
            }
        )
    }

}

module.exports = {
    ResetPassword,
    ResetPasswordLinkGenerator
}