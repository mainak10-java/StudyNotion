const express = require('express')
const router = express.Router();

const {
    createCourse,
    getAllCourses,
    getCourseDetails
} = require('../controllers/Courses');

const {
    createCategory,
    getAllCategories,
    categoryPageDetails
} = require('../controllers/Categories');

const {
    createSection,
    updateSection,
    deleteSection
} = require('../controllers/Sections');

const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require('../controllers/SubSections');

const {
    createRating,
    getAllRatings,
    getAverageRating
} = require('../controllers/RatingsAndReviews');

const {
    auth,
    isAdmin,
    isInstructor,
    isStudent
} = require('../middlewares/auth');

// Course Routes
router.post('/createCourse', auth, isInstructor, createCourse);
router.post('/addSection', auth, isInstructor, createSection);
router.post('/addSubSection', auth, isInstructor, createSubSection);

router.put('/updateSection', auth, isInstructor, updateSection);
router.put('/updateSubSection', auth, isInstructor, updateSubSection);

router.delete('/deleteSection', auth, isInstructor, deleteSection);
router.delete('/deleteSubSection', auth, isInstructor, deleteSubSection);

router.get('/getAllCourses', getAllCourses);
router.get('/getCourseDetails', getCourseDetails);

// Category Routes
router.post('/createCategory', auth, isAdmin, createCategory);
router.get('/getAllCategories', getAllCategories);
router.get('/getCategoryPageDetails', categoryPageDetails);


//Rating and review routes
router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating/:id', getAverageRating);
router.get('/getAllRatings', getAllRatings);


module.exports = router;
