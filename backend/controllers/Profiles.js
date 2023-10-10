const Profile = require('../models/Profile')
const User = require('../models/userModel')
const Course = require('../models/Course')
const {uploadImageCloudinary} = require('../Utils/imageUploader')


exports.updateProfile = async(req, res) => {
    try{
        const {dateOfBirth='', gender, about='', contactNumber} = req.body;

        const userId = req.user.id;
        if(!gender || !contactNumber || !userId){
            return res.status(400).json({
                success : false,
                message : 'All fields must be filled properly'
            })
        }

        //Find profile
        const userDetails = await User.findById(userId);
        const profileDetails = await Profile.findById(userDetails.additionalDetails);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();

        res.status(200).json({
            success : false,
            message : 'Profile updated successfully',
            data : profileDetails,
        })
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while updating profile'
        })
    }
}

exports.deleteProfile = async(req, res) => {
    try{
        const userId= req.user.id;

        const user = await User.findById({_id: userId});
        if(!user){
            return res.status(400).json({
                success : false,
                message : 'User not found'
            })
        }
        await Profile.findByIdAndDelete({_id : user.additionalDetails});
        // Unenroll user from all the enrolled courses

        for (const courseId of user.courses) {
            await Course.findByIdAndUpdate(
               courseId,
              { $pull: {studentsEnrolled: userId } },
              { new: true }
            )
        }

        await User.findByIdAndDelete({_id : userId});
        return res.status(200).json({
            success : true,
            message : 'Profile deleted successfully'
        })

    } catch(error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while deleting profile'
        })
    }
}

exports.getAllUserDetails = async (req, res) => {

    try {
        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
        });
       
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateProfilePicture = async(req, res) => {
    try{
        const userId = req.user.id;
        const picture = req.files.profilePicture;

        const image = await uploadImageCloudinary(picture, process.env.FOLDER_NAME);

        const userDetails = await User.findByIdAndUpdate({_id : userId},
                                                        {
                                                            image : image.secure_url
                                                        },
                                                        {new : true});
        
        return res.status(200).json({
            success : true,
            message : 'Image updated successfully',
            data : userDetails
        })
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}

exports.getEnrolledCourses = async(req, res) => {
    try{
        const userId = req.user.id;
        const findCourses = await User.findOne({_id : userId}).populate('courses').exec();

        if(!findCourses){
            return res.status(404).json({
                success : false,
                message : 'No courses found'
            })
        }

        return res.status(200).json({
            success : true,
            data : findCourses.courses
        })
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message 
        })
    }
}