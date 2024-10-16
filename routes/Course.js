

const express = require('express');
const router = express.Router();

const {createCourse , getAllCourses , getSingleCourse  , getIntructorCourses , publishCourse , updateCourse , getSingleCourseWithProgress} = require('../controllers/Course');
const {createTag , getTags} = require('../controllers/Tag');
const {createCategory , getCategories , getCategoryPageDetails } = require('../controllers/Category');
const {addSection , deleteSection , updateSection } = require('../controllers/CourseSection');
const {addSubSection , deleteSubSection , updateSubSection} = require('../controllers/CourseSubSection');
const{createReviewAndRating , getAllRatingsAndReviews , getAllReviewsAndRtingsOfACourse , getAverageRatings} = require('../controllers/RatingAndReview');
const {updateCourseProgress} = require('../controllers/CourseProgress')

// We need middlewares also
const {isValid , isStudent , isInstructor , isAdmin} = require('../middlewares/auth');



// First CATEGORY ROUTES
// OPEN FOR ALL NON LOGGED IN USER ALSO
router.post('/createCategory'  , isValid , isAdmin , createCategory);
router.get('/getCategories' ,  getCategories);
router.post('/getCategoryPageDetails' ,  getCategoryPageDetails);



// Getting Course Details
// OPEN FOR ALL NON LOGGED IN USES ALSO
router.get('/getAllCourses' ,  getAllCourses);
router.post('/getSingleCourse' ,  getSingleCourse);
router.post('/getSingleCourseWithProgress' , isValid , isStudent , getSingleCourseWithProgress);



// Creating ALL Courses
router.post('/createCourse' , isValid , isInstructor , createCourse);
router.post('/addSection' , isValid , isInstructor , addSection);
router.put('/updateSection' , isValid , isInstructor , updateSection);
router.delete('/deleteSection' , isValid , isInstructor , deleteSection);
router.post('/addSubSection' , isValid , isInstructor , addSubSection);
router.put('/updateSubSection' , isValid , isInstructor , updateSubSection);
router.delete('/deleteSubSection' , isValid , isInstructor , deleteSubSection);
router.put('/publishCourse' , isValid , isInstructor , publishCourse);
router.put('/updateCourse' , isValid , isInstructor , updateCourse);
router.post('/getInstructorCourses'  , getIntructorCourses);

// Updating course progress
router.post("/updateCourseProgress" , isValid , isStudent , updateCourseProgress );


// Creating RatingsAndReviews Routes
router.post('/createReview' , isValid , isStudent , createReviewAndRating);
router.post('/getReviewsOfCourse'  , getAllReviewsAndRtingsOfACourse);
router.post('/getAverageRatings' ,  isValid , getAverageRatings);
router.get('/getAllReviews' , getAllRatingsAndReviews);

module.exports = router;