// index.js

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const rideRoutes = require('./routes/rides');
const cors = require('cors');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors()); // Allow Cross-Origin requests
app.use(express.json()); // Parse JSON bodies
app.use(logger); // Custom request logger
app.use(morgan('dev')); // HTTP request logging

// Routes
app.use('/api/rides', rideRoutes);

// Root route for quick check
app.get('/', (req, res) => {
  res.send('RIDE INDIA API is running...');
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

//GPT Vehicle Integration
const vehicleRoutes = require('./routes/vehicle');
app.use('/api/gpt-vehicle-fetch', vehicleRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
