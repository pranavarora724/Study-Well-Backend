
const jwt = require('jsonwebtoken');
require("dotenv").config();


// Is valid or not
async function isValid(req , res , next)
{
    try {

        console.log("Inside middleware");

        const token = req.body.token || 
                  req.cookies.tokenCookie ||   //name of cookie "tokenCookie"
                  req.header("Authorisation").replace("Bearer ","");

                  console.log("Token = " , token);

                  if(!token)
                  {
                    res.status(400).json(
                        {
                            success:false,
                            message:"Token not exists"
                        }
                    )
                  }

                  try {
                    
                  const payload = jwt.verify(token , process.env.JWT_SECRET);
                  req.userDetails = payload;

                  } catch (error) {
                    
                    return res.status(400).json(
                        {
                            success:false,
                            message:error
                        }
                    )
                  }
        
    } catch (error) {

        return res.status(400).json(
            {
                success:false,
                error:error.message,
                message:"Protected route for logged in users"
            }
        )
    }

    next();
}

// Is student

async function isStudent(req , res , next)
{
    const accountType = req.userDetails.accountType

    if(accountType !== "Student")
    {
        return res.status(400).json(
            {
                success:false,
                message:"Not a Student Profile"
            }
        )
    }
    next();
}

async function isInstructor(req , res , next)
{
    const accountType = req.userDetails.accountType

    if(accountType !== "Instructor")
    {
        return res.status(400).json(
            {
                success:false,
                message:"Not an Instructor Profile"
            }
        )
    }
    next();
}

async function isAdmin(req , res , next)
{
    const accountType = req.userDetails.accountType

    if(accountType !== "Admin")
    {
        return res.status(400).json(
            {
                success:false,
                message:"Not an Admin Profile"
            }
        )
    }
    next();
}

module.exports = {
    isValid,
    isStudent,
    isInstructor,
    isAdmin
}