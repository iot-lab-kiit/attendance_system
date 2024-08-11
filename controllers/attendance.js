const user = require("../model/user");
const multer = require('multer');
const path = require('path');
const fs = require('fs');




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
      const { rollNumber } = req.body;
      cb(null, `${rollNumber}${path.extname(file.originalname)}`); 
    }
  });

  exports.upload = multer({ storage: storage });
//   console.log('Upload middleware:', upload);

//  register a user
exports.registerUser = async (req, res) => {

  try {
    console.log('Uploaded File:', req.file);
    console.log(req.body);
    const { rollNumber, email } = req.body;

    const existingUser = await user.findOne({ $or: [{ rollNumber }, { email }] });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this roll number or email already exists',
      });
    }

    const newUser = await user.create({ rollNumber, email, imagePath: req.file.path });
    

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

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const imagePath = existingUser.imagePath;

    if (fs.existsSync(imagePath)) {
      res.sendFile(path.resolve(imagePath));
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found',
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


  