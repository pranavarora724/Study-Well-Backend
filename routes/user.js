
const express = require('express');
const router = express.Router();

const {signIn , logIn ,generateOtp , changePassword} = require('../controllers/auth'); 
const {ResetPassword , ResetPasswordLinkGenerator} = require('../controllers/ResetPassword')

const {isValid} = require('../middlewares/auth');

// AUTH ROUTES
// These routes are accessible by everyione as User is still not Logged In
router.post('/signIn' , signIn);
router.post('/logIn' , logIn);
router.post('/generateOtp' , generateOtp);
router.post('/changePassword' , isValid ,changePassword);
// We do use 'isValid' bcoz password change karne ke liye user registerd hona chahiyre
// We used 'req.userDetails' in 'cangePassword' controller
 
// ReSet Password ROUTES

// Router for generating reset password link
router.post('/resetPasswordLink' ,  ResetPasswordLinkGenerator);

// Router for Resetting new password after link generation
router.post('/resetPassword' ,  ResetPassword);


module.exports = router;

