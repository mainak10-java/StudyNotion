const mongoose = require('mongoose')
const mailSender = require('../Utils/mailSender')

const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    otp : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now(),
        expires : 5*60
    }
})

async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, 'Verification email from StudyNotion ✅', `<p>The OTP for verification is :- <br> <h1>${otp}</h1></p>`)
    } catch(error){
        console.log('Error occured while sending mail :', error);
        throw error;
    }
}

otpSchema.pre('save', async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model('OTP', otpSchema);