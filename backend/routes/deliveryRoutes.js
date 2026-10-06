const express = require('express');
const multer = require('multer');

const {
  registerDeliveryAgent,
  getDeliveryProfilePhoto,
} = require('../controllers/deliveryController');

const router = express.Router();

// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only JPG, PNG and WEBP images are allowed.'
        )
      );
    }
  },
});

// ============================================================
// DELIVERY REGISTRATION
// ============================================================

router.post(
  '/register',
  upload.single('profilePhoto'),
  registerDeliveryAgent
);

// ============================================================
// DELIVERY PROFILE PHOTO
// ============================================================

router.get(
  '/profile-photo/:userId',
  getDeliveryProfilePhoto
);

module.exports = router;