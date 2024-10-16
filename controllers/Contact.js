
const mailSender = require('../config/emailSender');
const contactUsTemplate = require('../mailTemplates/contactUsTemplate');

async function contactUs(req , res)
{
    try {

        const {
            firstName , 
            lastName ,
            email,
            contactNumber,
            message
        } = req.body;
    
        if(!email || !contactNumber || message)
        {
            return res.status(400).json(
                {
                    success:false,
                    message:'Fill all the fields'
                }
            )
        }
    
        // Sending mail to CODE-Help about the complaint sent
       const emailRes1 =  await mailSender('pranavarora724@gmail.com' , 'User Complaint' , `${message}`);
    
        // Sending mail to the child about the COMPLAINT is succesfully sent
        const mailBody = contactUsTemplate(email , firstName , lastName , message , contactNumber);
      const emailRes2 =  await mailSender(`${email}` , 'Study-Notion Customer Care' , mailBody);
    
      console.log(emailRes1);
      console.log(emailRes2);
    
      return res.status(200).json(
        {
            success:true , 
            message:'Complaint Email Sent Successfully'
        }
      )
    
        
    } catch (error) {
        
        console.log(error);
        return res.status(500).json(
            {
                success:false,
                message:error.message,
                body:'Error while Sending Complaint'
            }
        )
    }
}

module.exports = {
    contactUs
}