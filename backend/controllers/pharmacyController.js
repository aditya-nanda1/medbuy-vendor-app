const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

async function registerPharmacy(req, res) {
  const {
    name,
    storeName,
    email,
    phone,
    password,
  } = req.body;

  // Basic validation
  if (!name || !storeName || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check whether email already exists
    const [existingEmail] = await connection.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );

    if (existingEmail.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Check whether phone already exists
    const [existingPhone] = await connection.execute(
      'SELECT id FROM users WHERE phone = ? LIMIT 1',
      [phone.trim()]
    );

    if (existingPhone.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [userResult] = await connection.execute(
      `INSERT INTO users
        (name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        passwordHash,
        'pharmacy',
      ]
    );

    const userId = userResult.insertId;

    // Create pharmacy
    await connection.execute(
      `INSERT INTO pharmacies
        (user_id, store_name)
       VALUES (?, ?)`,
      [
        userId,
        storeName.trim(),
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Pharmacy account created successfully',
      userId,
    });
  } catch (error) {
    await connection.rollback();

    console.error('Pharmacy registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create pharmacy account',
    });
  } finally {
    connection.release();
  }
}

module.exports = {
  registerPharmacy,
};
async function loginPharmacy(req, res) {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and password are required',
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.password_hash,
        u.role,
        p.id AS pharmacy_id,
        p.store_name
       FROM users u
       INNER JOIN pharmacies p
         ON p.user_id = u.id
       WHERE u.phone = ?
         AND u.role = 'pharmacy'
       LIMIT 1`,
      [phone.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password',
      });
    }

    const user = rows[0];

    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        pharmacyId: user.pharmacy_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        pharmacyId: user.pharmacy_id,
        storeName: user.store_name,
      },
    });
  } catch (error) {
    console.error('Pharmacy login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to login',
    });
  }
}

module.exports = {
  registerPharmacy,
  loginPharmacy,
};