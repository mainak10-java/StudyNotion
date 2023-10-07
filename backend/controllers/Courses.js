const Course = require('../models/Course')
const uploadImageCloudinary = require('../Utils/imageUploader')
const User = require('../models/userModel')
const Category = require('../models/Category')

exports.createCourse = async(req, res) => {
    try{
        const {courseName, courseDescription, whatYouWillLearn, tags, price, category, status, instructions} = req.body;

        //Image to be uploaded
        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !tag || !price || !thumbnail){
            return res.status(400).json({
                success : false,
                message : 'All fields are required'
            })
        }

        if(!status || status === undefined){
            status = 'Draft'
        }


        // Check for the instructor details
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {accountType : 'Instructor'});

        if(!instructorDetails){
            return res.status(400).json({
                success : false,
                message : 'Instructor details not found'
            })
        }

        // Validate if the tag is correct or not
        const categoryDetails = await Category.findById(category)

        if(!categoryDetails){
            return res.status(400).json({
                success : false,
                message : 'Category not found'
            })
        }

        const thumbnailImage = await uploadImageCloudinary(thumbnail, process.env.FOLDER_NAME)

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            whatYouWillLearn : whatYouWillLearn,
            price,
            tag : tags,
            instructor : instructorDetails._id,
            categories : categoryDetails._id,
            thumbnail : thumbnailImage.secure_url,
            status : status, 
            instructions : instructions
        })

        //Updates the courses of user schema
        await User.findByIdAndUpdate(
            {_id : instructorDetails._id},
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {new : true}
        )
        
        // Update the tag  schema
        await Category.findByIdAndUpdate(
            {_id : category},
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

exports.getAllCourses = async (req, res) => {
    try {
            //TODO: change the below statement incrementally
            const allCourses = await Course.find({},{
                courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				ratingAndReviews: true,
				studentsEnroled: true,
            })
            .populate("instructor")
			.exec();

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

//TODO : getCourseDetails