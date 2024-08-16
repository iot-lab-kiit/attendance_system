const user = require("../model/user");
const Attendance = require("../model/attendance");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const faceapi = require("face-api.js");
const canvas = require("canvas");
// const tf = require("@tensorflow/tfjs-node");

// header auth
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//  handle the scanned image and match it
exports.matchUserImage = async (req, res) => {
  try {
    const { rollNumber, email } = req.body;
    console.log("req.body", req.file);
    const scannedImageBuffer = req.file.buffer;

    const existingUser = await user.findOne({ rollNumber });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { imageUUIDs } = existingUser;
    const storedImagePaths = imageUUIDs.map((uuid) =>
      path.join("uploads", `${uuid}.png`)
    );

    if (storedImagePaths.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found for matching",
      });
    }

    // models for face-api.js
    await faceapi.nets.ssdMobilenetv1.loadFromDisk("./match-models");
    await faceapi.nets.faceRecognitionNet.loadFromDisk("./match-models");
    await faceapi.nets.faceLandmark68Net.loadFromDisk("./match-models");

    // scanned image from buffer
    const scannedImage = await canvas.loadImage(scannedImageBuffer);

    // Detect and extract features from the scanned image
    const scannedImageDescriptor = await faceapi.computeFaceDescriptor(
      scannedImage
    );

    let matchFound = false;
    for (let storedImagePath of storedImagePaths) {
      const storedImage = await canvas.loadImage(storedImagePath);
      const storedImageDescriptor = await faceapi.computeFaceDescriptor(
        storedImage
      );

      const distance = faceapi.euclideanDistance(
        scannedImageDescriptor,
        storedImageDescriptor
      );
      if (distance < 0.6) {
        matchFound = true;
        break;
      }
    }

    if (matchFound) {
      return res.status(200).json({
        success: true,
        message: "Face match successful. Attendance marked.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Face match failed.",
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
