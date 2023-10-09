const User = require('../models/userModel')
const OTP = require('../models/OTP')
const Profile = require('../models/Profile')

const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.sendOTP = async(req, res) => {
    try{
        const {email} = req.body;

        //Check if the user is present or not
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                success : false,
                message : 'User already registered'
            })
        }

        //Generate OTP 
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false
        });

        // Lets check if the generated otp is unique or not
        let result = await OTP.findOne({otp : otp});

        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false
            });
            
            result = await OTP.findOne({otp : otp});
        }

        // Create an entry of otp in the database
        const otpBody = await OTP.create({email, otp});
        res.status(200).json({
            success : true,
            otp,
            message : 'OTP sent successfully'
        })

    } catch(error){
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

exports.signUp = async(req, res) => {
    try{
        const {
            firstName,
            lastName,
            password,
            confirmPassword,
            email, 
            accountType,
            phone,
            otp
        } = req.body;

        // Validate
        if(!firstName || !lastName || !password || !confirmPassword || !email || !accountType || !otp){
            return res.status(403).json({
                success : false,
                message : 'All fields must be filled'
            })
        }

        // Check if the password's match or not
        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : 'Passwords do not match'
            })
        }

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success : false,
                message : 'User already exists'
            })
        }

        // Check if the OTP entered is correct
        const recentOTP = await OTP.find({email}).sort({createdAt : -1}).limit(1);

        if(recentOTP.length == 0){
            return res.status(400).json({
                success : false,
                message : 'OTP not found'
            })
        } else if(otp !== recentOTP[0].otp){
            return res.status(400).json({
                success : false,
                message : 'Invalid OTP'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let approved = '';
        approved === 'Instructor' ? (approved = false) : (approved = true)

        // Create a entry in the db
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumer:null,
        });
        const user = await User.create({
            firstName,
            lastName,
            phone,
            password : hashedPassword,
            email,
            accountType : accountType,
            approved : approved,
            image : `https://api.dicebear.com/7.x/bottts/jpg`,
            additionalDetails: profileDetails._id
        })

        res.status(200).json({
            success : true,
            user,
            message : 'User signed in successfully'
        })

    } catch(error){
        return res.status(400).json({
            success : false,
            message : 'User cannot be registered. Please try again later'
        })
    }
}

exports.login = async(req, res) => {
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(403).json({
                success : false,
                message : 'All fields are required'
            })
        }

        const existingUser = await User.findOne({email}).populate('additionalDetails');
        if(!existingUser){
            return res.status(400).json({
                success : false,
                message : 'User does not exist, please sign up first'
            })
        }

        //Generate JWT after password matching
        const match = bcrypt.compare(password, existingUser.password);
        if(match){
            const payload = {
                email : existingUser.email,
                id : existingUser._id,
                accountType : existingUser.accountType
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn : '24h'
            })

            existingUser.token = token;
            existingUser.password = undefined;

            const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};

            res.cookie('token', token, options).status(200).json({
                success : true,
                token,
                existingUser,
                message : 'Logged in successfully'
            })
        }
    }catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Login failed, please try again later'
        })
    }   
}

exports.changePassword = async(req, res) => {
    try{
        const {email, oldPassword, newPassword, confirmPassword} = req.body;
        
        if(!oldPassword || !newPassword || !confirmPassword){
            return res.status(403).json({
                success : false,
                message : 'All fields must be filled'
            })
        }
        
        const user = await User.findById(req.user.id);

        const match=bcrypt.compare(oldPassword, user.password)
        if(!match){
            // If old password does not match, return a 401 (Unauthorized) error
			return res
            .status(401)
            .json({ success: false, message: "The password is incorrect" });
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : 'New passwords do not match'
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await User.findByIdAndUpdate(req.user.id,{ password : hashedPassword}, {new : true});
        

        //TODO : Implement the mailsender functionality upon password changge
        
        res.status(200).json({
            success : true,
            user,
            message : 'Password changed successfully'
        })
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Cannot change the password, please try again later'
        })
    }
}