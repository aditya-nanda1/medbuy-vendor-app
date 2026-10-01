const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testDatabaseConnection } = require('./db');

const pharmacyRoutes = require('./routes/pharmacyRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Health Check
// ===============================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MedBuy Backend API is running',
  });
});

// ===============================
// Pharmacy Routes
// ===============================
app.use('/api/pharmacy', pharmacyRoutes);

// ===============================
// Delivery Agent Routes
// ===============================
app.use('/api/delivery', deliveryRoutes);

// ===============================
// Start Server
// ===============================
app.listen(PORT, async () => {
  console.log(`🚀 MedBuy backend running on port ${PORT}`);

  await testDatabaseConnection();
});