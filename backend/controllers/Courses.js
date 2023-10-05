const Course = require('../models/Course')
const uploadImageCloudinary = require('../Utils/imageUploader')
const User = require('../models/userModel')
const Tag = require('../models/Tag')

exports.createCourse = async(req, res) => {
    try{
        const {courseName, courseDescription,whatYouWillLearn, tag, price} = req.body;

        //Image to be uploaded
        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !tag || !price || !thumbnail){
            return res.status(400).json({
                success : false,
                message : 'All fields are required'
            })
        }


        // Check for the instructor details
        const instructorId = req.user.id;
        const instructorDetails = await User.findById({instructorId})

        if(!instructorDetails){
            return res.status(400).json({
                success : false,
                message : 'Instructor details not found'
            })
        }

        // Validate if the tag is correct or not
        const tagDetails = await Tag.findById({tag})

        if(!tagDetails){
            return res.status(400).json({
                success : false,
                message : 'Tag not found'
            })
        }

        const thumbnailImage = await uploadImageCloudinary(thumbnail, process.env.FOLDER_NAME)

        const newCourse = await Course.create({
            courseName,
            courseContent,
            whatYouWillLearn,
            price,
            instructor : instructorId,
            tags : tagDetails._id,
            thumbnail : thumbnailImage.secure_url
        })

        //Updates the courses of user schema
        await User.findByIdAndUpdate(
            {_id : instructorId},
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {new : true}
        )
        
        // Update the tag  schema
        await Tag.findByIdAndUpdate(
            {_id : tagDetails._id},
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {new : true}
        )

        res.status(200).json({
            success : false,
            message : 'Course created successfully'
        })

    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong, while creating the course'
        })
    }
}

exports.showAllCourses = async (req, res) => {
    try {
            //TODO: change the below statement incrementally
            const allCourses = await Course.find({});

            return res.status(200).json({
                success:true,
                message:'Data for all courses fetched successfully',
                data:allCourses,
            })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }
}