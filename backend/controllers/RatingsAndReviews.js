const Course = require('../models/Course');
const User = require('../models/userModel')
const RatingAndReview = require('../models/RatingAndReview');
const { default: mongoose } = require('mongoose');

exports.createRating = async(req, res) => {
    try{
        const userId= req.user.id;

        const {rating, review, courseId} = req.body;

        //Check if the user is enrolled in the course or not
        const courseDetails = await Course.findOne(
                                           {_id: courseId,
                                            studentsEnrolled : {$eleMatch : {$eq : userId}},
                                           });
        
        if(!courseDetails){
            return res.status(400).json({
                success : false,
                message : 'Student is not enrolled'
            })
        }

        //Check whether the student has already reviewd the course or not
        const alreadyReviewed = await RatingAndReview.findOne({
                                                    user : userId,
                                                    course : courseId
        });

        if(alreadyReviewed){
            return res.status(400).json({
                success : false,
                message : error.message
            })
        }

        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            user: userId,
            course : courseId
        })

        // Update the course schema

        const updatedCourseDetails = await Course.findByIdAndUpdate({_id : courseId},
                                                                    {
                                                                        $push : {
                                                                            ratingAndReviews : ratingReview._id
                                                                        }
                                                                    },
                                                                    {new : true}
        );

        return res.status(200).json({
            success : true,
            message : 'Rating and review successfully created',
            ratingReview
        })
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

exports.getAllRatings = async(req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                                .sort({rating : -1})
                                                .populate({
                                                    path : 'user',
                                                    select : 'firstName lastName email image'
                                                })
                                                .populate({
                                                    path : 'course',
                                                    select : 'courseName'
                                                })
                                                .exec();

        return res.status(200).json({
            success : true,
            message :'All ratings and reviews are fetched',
            data : allReviews
        })
    } catch(error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while fetching ratings and  reviews'
        })
    }
}

exports.getAverageRating = async(req, res) => {
    try{
        const {courseId} =  req.body;

        // Calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match : {
                    course : new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group : {
                    _id : null,
                    averageRating : result[0].averageRating,
                 }
            }
        ])

        // Return rating
        if(result.length > 0){
            return res.status(200).json({
                success : true,
                averageRating : result[0].averageRating
            })
        }

         //if no rating/Review exist
         return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no ratings given till now',
            averageRating:0,
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// Can add delete rating feature