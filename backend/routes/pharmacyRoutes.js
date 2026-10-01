const express = require('express');

const {
  registerPharmacy,
  loginPharmacy,
} = require('../controllers/pharmacyController');

const router = express.Router();

router.post('/register', registerPharmacy);
router.post('/login', loginPharmacy);

module.exports = router;