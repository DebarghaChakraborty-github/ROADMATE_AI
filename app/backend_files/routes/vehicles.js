const express = require('express');
const router = express.Router();
const { getVehicleSpecs } = require('../controllers/vehicleController');

router.post('/specs', getVehicleSpecs);

module.exports = router;
