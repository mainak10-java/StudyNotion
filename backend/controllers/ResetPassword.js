const User =  require('../models/userModel')
const uuid = require('uuid-random');
const mailSender = require('../Utils/mailSender')
const bcrypt = require('bcrypt')

exports.resetPasswordToken = async(req, res) => {
    try{
        const {email} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success : false,
                message : 'User not found'
            })
        }

        const token = uuid();
        console.log(token);

        const updatedDetails = await User.findOneAndUpdate(
                                                            {email: email},
                                                            {
                                                                token : token,
                                                                expiresIn : Date.now() + 5*60*1000,
                                                            },
                                                            {new : true});
        
        const url = `http://localhost:3000/update-password/${token}`;
        console.log(url);
        const emailS = await mailSender(email, 'Password Reset Link' , `<p>The link to reset the password is : <br> ${url}</p>`);
        console.log(emailS);
        return res.status(200).json({
            success:true,
            message:'Email sent successfully, please check email and change pwd',
            data : emailS
        });
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while sending reset password mail'
        })
    }
}

exports.resetPassword = async(req, res) => {
    try{
        const {password, confirmPassword, token} = req.body;
        
        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : 'Passwords do not match'
            })
        }

        //Get user details from db
        const userDetails = await User.findOne({token : token})
        if(!userDetails){
            return res.status(400).json({
                success : false,
                message : "Token is invalid"
            })
        }

        // link expiration check
        if(userDetails.expiresIn < Date.now()){
            return res.status(400).json({
                success : false,
                message : "Token has expired, please regenerate another link"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong, could not reset the password'
        })
    }
}