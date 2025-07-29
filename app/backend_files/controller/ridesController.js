const Ride = require('../models/rideModel');

// @desc    Create a new ride
// @route   POST /api/rides
exports.createRide = async (req, res) => {
  try {
    const ride = await Ride.create(req.body);
    res.status(201).json(ride);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Get all rides
// @route   GET /api/rides
exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get single ride
// @route   GET /api/rides/:id
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete ride
// @route   DELETE /api/rides/:id
exports.deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json({ message: 'Ride deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
