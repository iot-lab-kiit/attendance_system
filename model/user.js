const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    maxLength: 10,
    unique:true,
  },

  email: {
    type: String,
    required: true,
    unique:true,
  },

  imageUUIDs:{
    type:[String],
    required: true,
  }
});

module.exports = mongoose.model("USER", userSchema);
