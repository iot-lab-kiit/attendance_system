const user = require("../model/user");
const Attendance = require("../model/attendance");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
const { v4: uuidv4 } = require("uuid");

// const tf = require("@tensorflow/tfjs-node");

// Required for face-api.js to work with Node.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Authentication middleware
exports.auth = (req, res, next) => {
  const auth = req.headers.auth;

  if (auth === "true") {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing authentication",
    });
  }
};

// Configure multer to store files in the 'facematch-image' folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'facematch-image/'); 
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

const upload2 = multer({ storage: storage });

exports.matchUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const scannedImagePath = path.join('facematch-image', req.file.filename);
    console.log("scannedImagePath", scannedImagePath);

    const { rollNumber } = req.body;
    const existingUser = await user.findOne({ rollNumber });
    console.log("existingUser", existingUser);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
// const filetype=   `${uuid}.png`
    const { imageUUIDs } = existingUser;
    const storedImagePaths = imageUUIDs.map((uuid) =>
      path.join("uploads", `${uuid}.png`)
    );
    console.log("storedImagePaths", storedImagePaths[0].split('\\')[1]);

    if (storedImagePaths.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found for matching",
      });
    }

    // Load face-api.js models
    await faceapi.nets.ssdMobilenetv1.loadFromDisk("./match-models");
    await faceapi.nets.faceRecognitionNet.loadFromDisk("./match-models");
    await faceapi.nets.faceLandmark68Net.loadFromDisk("./match-models");

    console.log("Models loaded");

    // Convert buffer to image using canvas
    const scannedImage = await canvas.loadImage(scannedImagePath);
    console.log("scannedImage", scannedImage);

    // Detect and extract features from the scanned image
    const scannedImageDescriptor = await faceapi.computeFaceDescriptor(scannedImage);
    let distance;
    let matchFound = false;
    for (let storedImagePath of storedImagePaths) {
      //for windows
      // let storedPath = path.join('uploads', storedImagePath.split('\\')[1]);
      //for linux
      let storedPath = path.join(storedImagePath);
      const storedImage = await canvas.loadImage(storedPath);
      const storedImageDescriptor = await faceapi.computeFaceDescriptor(storedImage);

       distance = faceapi.euclideanDistance(scannedImageDescriptor, storedImageDescriptor);
      if (distance < 0.4) {
        matchFound = true;
        break;
      }
    }

    if (matchFound) {
      fs.unlinkSync(scannedImagePath);
      return res.status(200).json({
        success: true,
        message: "Face match successful. Attendance marked.",
        score: distance
      });
    } else {
      fs.unlinkSync(scannedImagePath);
      return res.status(400).json({
        success: false,
        message: "Face match failed.",
        score: distance
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Export the upload middleware
exports.upload2 = upload2.single('image'); 