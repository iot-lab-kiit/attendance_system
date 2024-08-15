const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ATTENDANCE", attendanceSchema);
