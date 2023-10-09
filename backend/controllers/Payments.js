const User = require('../models/userModel')
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');
const { instance } = require('../config/razorpay');


exports.capturePayment = async(req, res) => {
    const {courseId} = req.body;
    const userId = req.user.id;

    // Validate course  id
    if(!courseId){
        return res.status(400).json({
            success : false,
            message : 'Please provide valid course id'
        })
    }

    // Validate course details
    let course;
    try{
        course = await Course.findById(courseId);
        if(!course){
            return res.status(400).json({
                success : false,
                message : 'Could not find the course'
            })
        }

        // Check if the user is already in the course or not
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success : false,
                message : 'Student already enrolled'
            })
        }
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }

    // Create the order
    const amount = course.price;
    const currency = 'INR';

    const options = {
        amount : amount * 100,
        currency,
        reciept : Math.random(Date.now()).toString(),
        notes : {
            courseId : courseId,
            userId
        }
    };

    try{
        // Instantiate the payment using phone pe
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success : true,
            courseName : course.courseName,
            courseDescription : course.courseDescription,
            thumbnail : course.thumbnail,
            orderId : paymentResponse.id,
            currency : paymentResponse.currency,
            amount : paymentResponse.amount
        })
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Could not initiate order'
        })
    }
}


// Verify the signature of razorpay and server

exports.verifySignature = async(req, res) => {
    const webhookSecret = '123456789';
    
    const signature = req.headers['x-razorpay-signature'];

    const generatedSignature = crypto.createHmac('sha256', webhookSecret);
    generatedSignature.update(JSON.stringify(req.body));
    const digest = generatedSignature.digest('hex');

    if(signature === digest){
        console.log('Payment is authorised');

        const {userId, courseId} = req.body.payload.payment.entity.notes;

        try{
            // Find the course and add the student in it
            
            const enrolledCourse = await Course.findOneAndUpdate(
                                                {_id: courseId},
                                                {$push : {studentsEnrolled : userId}},
                                                {new : true}   
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success : false,
                    message : 'Course not found'
                })
            }

            // Find the user and add the course to their courses list
            const enrolledStudent = await User.findOneAndUpdate(
                                               {_id : userId},
                                               {$push : {courses : courseId}},
                                               {new : true}
            );

            //TODO: Send the confirmation mail
            
            
            return res.status(200).json({
                success : true,
                message : 'Signature verified and student enrolled'
            })
        } catch(error){
            console.log(error);
            return res.status(500).json({
                success : false,
                message : 'Something went wrong while verifying the signature'
            })
        }
    }
}