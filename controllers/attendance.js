const user = require("../model/user");
const Attendance = require('../model/attendance');

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

exports.validateUser = async(req, res,next) => {
  const { rollNumber, email } = req.body;
console.log("body:",req.body)
console.log('Uploaded Files:', req.files);

if (email !== `${rollNumber}@kiit.ac.in`) {
  req.files.forEach(file => {
    const filePath = path.join(__dirname, '../uploads/', file.filename);
    fs.unlinkSync(filePath); 
  });

  return res.status(400).json({
    success: false,
    message: 'Invalid email',
  });
}
  

  const existingUser =await user.findOne({ $or: [{ rollNumber }, { email }] });

    if (existingUser) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads/', file.filename);
        fs.unlinkSync(filePath);
      });
      return res.status(400).json({
        success: false,
        message: 'User with this roll number or email already exists',
      });
    }
    next();
};


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
      // const { rollNumber } = req.body;
      console.log("req",req.imageUUIDs);
      const uuid = uuidv4();
      if (!req.imageUUIDs) {
        req.imageUUIDs = [];
      }
      req.imageUUIDs.push(uuid);
      cb(null, `${uuid}${path.extname(file.originalname)}`); 
    }
  });

  exports.upload = multer({ storage: storage });

//  register a user
exports.registerUser = async (req, res) => {

  try {
    console.log('Uploaded File:', req.files);
    // console.log(req.body);
    const { rollNumber, email } = req.body;
    // const imageUUID = uuidv4();

    // const filesPath = req.files.map(file => file.path);
    const imageUUIDs = req.imageUUIDs;

    const newUser = await user.create({ rollNumber, email, imageUUIDs });
    

    res.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
console.log(this.registerUser)

//  get  user's image
exports.getUserImage = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const existingUser = await user.findOne({ rollNumber });
    console.log("existingUser:",existingUser);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not',
      });
    }
    
    
     const { imageUUIDs } = existingUser;
    
     if (!imageUUIDs) {
       return res.status(404).json({
         success: false,
         message: 'Image UUID not found',
       });
     }
    
    
     const imagePaths = imageUUIDs.map(uuid => path.join('uploads', `${uuid}.png`));
     console.log("Image Paths:", imagePaths);


     if (imagePaths.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No images found on the server',
      });
    }

    res.status(200).json({
      success: true,
      images: imagePaths.map(imagePath => path.resolve(imagePath)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};











exports.markAttendance = async (req, res) => {
  try {
    const { rollNumber, matchSuccess } = req.body;

    if (matchSuccess) {
      const attendanceRecord = new Attendance({
        rollNumber,
        status: 'present',
      });

      await attendanceRecord.save();

      return res.status(200).json({
        success: true,
        message: 'Attendance marked successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Image match failed',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



  