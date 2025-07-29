const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  riderName: {
    type: String,
    required: true,
    trim: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  vehicle: {
    type: String
  },
  cause: {
    type: String
  },
  club: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
