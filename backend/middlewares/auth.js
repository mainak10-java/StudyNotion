const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = async(req, res, next) => {
    try{

        //Extract the token
        const token = req.cookies.token ||
                    req.body.token   ||
                    req.header('Authorisation').replace('Bearer ','');

        console.log(token);

        //Check if the token is missing or not
        if(!token){
            return res.status(401).json({
                success : false,
                message : 'Token is missing'
            })
        }

        // Verify the token
        try{
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            console.log(payload);
            req.user = payload;
        } catch(error){
            return res.status(401).json({
                success : false,
                message : 'Invalid token'
            })
        }
        next();
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while validating the issue'
        })
    }
}

exports.isStudent = async(req, res, next) => {
    try{
        if(req.user.accountType !== 'Student'){
            return res.status(401).json({
                success : false,
                message : 'This is a protected route for students'
            })
        }
        next();
    } catch(error){
        return res.status(401).json({
            success : false,
            message : 'User role cannot be verified, please try again'
        })
    }
}

exports.isInstructor = async(req, res, next) => {
    try{
        if(req.user.accountType !== 'Instructor'){
            return res.status(401).json({
                success : false,
                message : 'This is a protected route for instructor'
            })
        }
        next();
    } catch(error){
        return res.status(401).json({
            success : false,
            message : 'User role cannot be verified, please try again'
        })
    }
}

exports.isAdmin = async(req, res, next) => {
    try{
        if(req.user.accountType !== 'Admin'){
            return res.status(401).json({
                success : false,
                message : 'This is a protected route for admin'
            })
        }
        next();
    } catch(error){
        return res.status(401).json({
            success : false,
            message : 'User role cannot be verified, please try again'
        })
    }
}