const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    maxLength: 10,
  },

  email: {
    type: String,
    required: true,
  },

  image:{
    type:[String],
    required: true,
  }
});

module.exports = mongoose.model("USER", userSchema);
