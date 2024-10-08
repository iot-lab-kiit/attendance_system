const express = require("express");
const router = express.Router();

const {registerUser}= require("../controllers/attendance");
const {getUserImage}=require("../controllers/attendance");
const {upload}=require("../controllers/attendance");
const {validateUser}=require("../controllers/attendance");
const {markAttendance} = require("../controllers/attendance");
const {auth}=require("../controllers/facematch");
const {matchUserImage, upload2}=require("../controllers/facematch");


router.post('/',upload.array('image', 2),validateUser ,  registerUser);
 
router.get("/:rollNumber", getUserImage); 
router.post('/mark-attendance', upload2,auth, matchUserImage);
// router.get('/getUserImage/:rollNumber', getUserImage); 

module.exports = router;