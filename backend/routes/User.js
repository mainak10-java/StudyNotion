const express = require('express')
const router = express.Router();

const {
    login,
    signUp,
    sendOTP,
    changePassword
} = require('../controllers/Auth');

const {
    resetPassword,
    resetPasswordToken
} =  require('../controllers/ResetPassword');

const {auth} = require('../middlewares/auth');

// Route for user login
router.post('/login', login);

//Route for signup
router.post('/signup', signUp);

//Route for sending OTP for email verification
router.post('/sendotp', sendOTP);

//Route for changing password
router.post('/changepassword', auth, changePassword);

//Route for generating reset password token
router.post('/reset-password-token', resetPasswordToken);

//Route for resetting password
router.post('/reset-password', resetPassword);

module.exports = router;
