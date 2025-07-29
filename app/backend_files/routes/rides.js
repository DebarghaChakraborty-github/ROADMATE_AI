const express = require('express');
const router = express.Router();
const {
  createRide,
  getAllRides,
  getRideById,
  deleteRide
} = require('../controllers/ridesController');

router.post('/', createRide);
router.get('/', getAllRides);
router.get('/:id', getRideById);
router.delete('/:id', deleteRide);

module.exports = router;
