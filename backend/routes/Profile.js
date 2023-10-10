const express = require('express');
const router = express.Router();

const {
    updateProfile,
    updateProfilePicture,
    deleteProfile,
    getAllUserDetails,
    getEnrolledCourses
} = require('../controllers/Profiles');

const {auth} = require('../middlewares/auth')

router.delete('/deleteProfile', deleteProfile);
router.put('/updateProfile', auth, updateProfile);
router.put('/update-profile-picture', auth, updateProfilePicture);
router.get('/getUserDetails', auth, getAllUserDetails);
router.get('/getEnrolledCourses', getEnrolledCourses);

module.exports = router;