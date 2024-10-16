const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
// const Profile = require('../models/Profile');
const sendMail = require('../config/emailSender');

// const
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const passwordUpdateTemplate = require('../mailTemplates/passwordUpdateTemplate');

// 1 - generateOtp function starts
async function generateOtp(req , res)
{
    try {
        
        const email = req.body.email;

        // Check for exisiting user
        const existingUser =await User.findOne(
            {email:email}
        )

        if(existingUser)
        {
            console.log("USER = ");
            console.log(existingUser);
            return res.status(400).json(
                {
                    success:false,
                    message:"User already exisits"
                }
            )
        }

        let generatedOtp = otpGenerator.generate( 6 , {
            upperCaseAlphabets: false, 
            specialChars: false,
            lowerCaseAlphabets:false
        });
        console.log("Generated otp = ",generatedOtp);

        // Now save an enry in databse of OTP "Tabhi pre middleware will work"

        const newOTP = new OTP({
            email:email,
            otp:generatedOtp
        } ); 

        const savedOTP = await newOTP.save(newOTP);
        
        return res.status(200).json(
            {
            success:true,
            message:"OTP generated Successfully",
            otp:generatedOtp
            }
        )


    } catch (error) {
        console.log("Error generating OTP");
        return res.json(
            {
                success:false,
                message:error.message
            }
        )
    }

}
// Generate OTP function ends


// 2 - Sign in Function starts
async function signIn(req , res){
   
    try {
        
        const {
            firstName , 
             lastName ,
             email ,
             password ,
             confirmPassword,
             accountType,
             otp
           } = req.body;
        
        //    Checking if ay field is empty
           if(!firstName || !lastName || !email || !confirmPassword || !password )
           {
              return res.status(400).json({
                success:false,
                message:"Fill all the required fields"
              }) 
           }

        //    Checking if user Already Exists?
        const existingUser = await User.findOne(
            {email:email}
        )

        if(existingUser)
        {
            return res.status(401).json(
                {
                    success:false,
                    message:"USer already exists"
                }
            )
        }

        // Checking if password and Confirm Pssword same or not
        if(password !== confirmPassword)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:"Password and Confirm Password are difffernet"
                }
            )
        }

        // Otp verification (uskeliye we need the newset stored otp)
        const recentOtp =await OTP.find(
            {email:email}
        ).sort({createdAt:-1}).limit(1);

        if(recentOtp.length==0)
        {
            return res.status(401).json(
                {
                    success:false,
                    message:"OTP not found"
                }
            )
        }

        console.log("Recent otp = ", recentOtp[0].otp);
        
        if(recentOtp[0].otp != otp)
        {
            return res.status(400).json({
                success:false,
                message:"OTP invalid"
            })
        }

        // Now Bcrypt the enterd passworrd
        let hashedPassword = await bcrypt.hash(password , 10);


        // Creatig a dummy profile object
        const profileObject = new Profile(
            {
                gender:null,
                about:null,
                dob:null,
                contactNumber:null
            }
        );

        const savedProfile = await profileObject.save();

        const newUser = new User(
            {
                firstName:firstName,
                lastName:lastName,
                email:email,
                password:hashedPassword,
                confirmPassword:hashedPassword,
                accountType:accountType,
                profile:savedProfile._id,
                imageUrl:`https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff`
        }

        )
        const createdUser = await newUser.save();
        console.log(createdUser);

        return res.status(200).json(
            {
                success:true,
                message:"User Created Successfully",
                user:createdUser
            }
        )
    }catch(error) {

    console.log("Error creating user");
        return res.status(400).json(
            {
                success:false,
                messaage:error
            }
        )
    }
}
// Sign In Function ends


// 3 - Log in Controller
async function logIn(req , res){

try {

    const email = req.body.email;
    const password = req.body.password;
    console.log("Inside Login Controller");
    console.log("Email = " , email);
    console.log("Password = " , password);

    // Check if fields empty or not
    if(!email || !password)
    {
        return res.status(400).json(
            {
                success:false,
                message:"Fill all the fields"
            }
        )
    }

    // Check if user exists or not
    const existingUser =await User.findOne(
                                    {email:email}
                                    ).populate("profile")
                                    .exec();

    console.log("Existing user = " , existingUser);

    if(!existingUser)
    {
        return res.status(400).json(
            {
                success:false,
                message:"No User Found Create an Account"
            }
        )
    }

    console.log("USer exists");

    // Now compare password with stored password
    if( await bcrypt.compare(password , existingUser.password))
    {
        // Makea JWT and use Token

        payload={
            accountType:existingUser.accountType,
            email:existingUser.email,
            id:existingUser._id
        }

        const token = jwt.sign(payload , process.env.JWT_SECRET , {
            expiresIn:"2h",
        });

        existingUser.token = token;
        existingUser.password = undefined;

        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true
        }

        res.cookie("tokenCookie" , token , options).status(200).json(
            {
                success:true,
                message:"Loggen in successfully",
                token:token,
                user:existingUser
            }
        );

    }
    else{
        return res.status(400).json(
            {
                success:false,
                message:"Invalid password"
            }
        )
    }
    
} catch (error) {
    
console.log("Error during sign up");
console.log("Message = " , error.message);
    res.status(401).json(
        {
            success:false,
            message:'Error during Login',
            body:error.message
        }
    )
}

}
// Log in controller ends


// 4 - Change passsword controller
// Get userId from req.userDetails.id
// Get old and new Password in input
// Check wherther old password matchs or not
// If old password matchesUpdaate with new password
async function changePassword(req , res)
{
    try {

        const userId = req.userDetails.id;

        const id = new mongoose.Types.ObjectId(userId);
    //    const id = mongoose.Types.ObjectId(`${userId}`);
        // const id =  ObjectId.fromString( userId );
        // const id = new ObjectId(userId);
        // console.log("Id = ", id);

        // console.log("User id = " , id);
        console.log("ID = " , id);

        const existingUser = await User.findOne(
            {_id: id}
        );

        console.log("ExistingUser = " , existingUser);
    
        const {oldPassword , newPassword} = req.body;
    
        if(!oldPassword || !newPassword)
        {
            return res.status(401).json({
                success:false,
                message:'Please enter both the fields'
            })
        }

        console.log("Old password = " , oldPassword);
        console.log("New Passsword = " , newPassword);
    
        if( await bcrypt.compare(oldPassword , existingUser.password))
        {
            let hashedPassword = await bcrypt.hash(newPassword , 10);
    
            // Old password enterd is correct
            const updatedUser = await User.findOneAndUpdate(
                                                     {_id :id} , 
                                                     {password: hashedPassword},
                                                     {new:true}
                                                    );
            console.log("Password updaed");

        //    Sending mail to student
            const mailBody = passwordUpdateTemplate(updatedUser.firstName , updatedUser.email);
           await sendMail(updatedUser.email , 'Password Chnaged Successfully' , mailBody);
           
           return res.status(200).json(
                {
                    success:true,
                    message:'Password is updated Successfully'
                }
            )
        }
        else{
            // Old password is INCORECt
            console.log("Old password incorrect");
    
            return res.status(401).json({
                success:false,
                message:'Old password entered is wrong'
            });
        }
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Error in updating password',
            body:error.message
        });
    }
}

// Change password controller ends
module.exports = {
    generateOtp , 
    signIn,
    logIn,
    changePassword
}
