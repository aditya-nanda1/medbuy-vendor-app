const bcrypt = require('bcrypt');
const { pool } = require('../db');

// ============================================================
// REGISTER DELIVERY AGENT
// ============================================================

const registerDeliveryAgent = async (req, res) => {
  let connection;

  try {
    console.log('--------------------------------');
    console.log('Delivery registration received');
    console.log('Body:', req.body);

    console.log(
      'File:',
      req.file
        ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        }
        : null
    );

    console.log('--------------------------------');

    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email, phone and password are required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile photo is required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least 6 characters.',
      });
    }

    const cleanName = name.trim();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid name.',
      });
    }

    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          'Please enter a valid phone number.',
      });
    }

    // ========================================================
    // CHECK EMAIL / PHONE
    // ========================================================

    const [existingUsers] = await pool.query(
      `
      SELECT id, email, phone
      FROM users
      WHERE email = ?
         OR phone = ?
      LIMIT 1
      `,
      [
        cleanEmail,
        cleanPhone,
      ]
    );

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];

      if (existing.email === cleanEmail) {
        return res.status(409).json({
          success: false,
          message:
            'An account with this email already exists.',
        });
      }

      if (existing.phone === cleanPhone) {
        return res.status(409).json({
          success: false,
          message:
            'An account with this phone number already exists.',
        });
      }
    }

    // ========================================================
    // HASH PASSWORD
    // ========================================================

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    // ========================================================
    // START TRANSACTION
    // ========================================================

    connection = await pool.getConnection();

    await connection.beginTransaction();

    // ========================================================
    // INSERT USER
    // ========================================================

    const [userResult] =
      await connection.query(
        `
        INSERT INTO users
        (
          name,
          email,
          phone,
          password_hash,
          role
        )
        VALUES (?, ?, ?, ?, 'delivery_agent')
        `,
        [
          cleanName,
          cleanEmail,
          cleanPhone,
          passwordHash,
        ]
      );

    const userId = userResult.insertId;

    // ========================================================
    // INSERT DELIVERY AGENT
    // ========================================================

    await connection.query(
      `
      INSERT INTO delivery_agents
      (
        user_id,
        profile_photo,
        profile_photo_type,
        is_online
      )
      VALUES (?, ?, ?, FALSE)
      `,
      [
        userId,
        req.file.buffer,
        req.file.mimetype,
      ]
    );

    // ========================================================
    // COMMIT
    // ========================================================

    await connection.commit();

    console.log(
      'Delivery agent created:',
      userId
    );

    return res.status(201).json({
      success: true,
      message:
        'Delivery account created successfully.',
      userId,
    });

  } catch (error) {
    console.error(
      'Delivery registration controller error:',
      error
    );

    // ========================================================
    // ROLLBACK
    // ========================================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          'Rollback error:',
          rollbackError
        );
      }
    }

    // ========================================================
    // DUPLICATE ENTRY
    // ========================================================

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message:
          'An account with this email or phone already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message:
        'Unable to create delivery account.',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};


// ============================================================
// GET DELIVERY PROFILE PHOTO
// ============================================================

const getDeliveryProfilePhoto = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        profile_photo,
        profile_photo_type
      FROM delivery_agents
      WHERE user_id = ?
      LIMIT 1
      `,
      [Number(userId)]
    );

    if (
      rows.length === 0 ||
      !rows[0].profile_photo
    ) {
      return res.status(404).json({
        success: false,
        message: 'Profile photo not found.',
      });
    }

    // Tell the client what type of image this is
    res.setHeader(
      'Content-Type',
      rows[0].profile_photo_type ||
      'image/jpeg'
    );

    // Prevent stale cached profile photos
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    res.setHeader(
      'Pragma',
      'no-cache'
    );

    res.setHeader(
      'Expires',
      '0'
    );

    // Send the actual MySQL BLOB
    return res.send(
      rows[0].profile_photo
    );

  } catch (error) {
    console.error(
      'Get delivery profile photo error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to load profile photo.',
    });
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  registerDeliveryAgent,
  getDeliveryProfilePhoto,
};