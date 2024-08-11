const express = require("express");
const router = express.Router();

const {registerUser}= require("../controllers/attendance");
const {getUserImage}=require("../controllers/attendance");
const {upload}=require("../controllers/attendance");

router.post('/', upload.single('image'), registerUser);
 
router.get("/:id", getUserImage); 
// router.get('/getUserImage/:rollNumber', attendance.getUserImage); 

module.exports = router;
