# MedBuy Vendor App

React Native Expo frontend with a Node.js/Express backend and MySQL database.

This README covers only the setup and running process.

---

## 1. Prerequisites

Install the following on the laptop:

- Git
- Node.js LTS
- npm
- MySQL Server
- MySQL Workbench (recommended)
- Expo Go on your mobile device (for physical-device testing)

Verify the installations:

```bash
git --version
node -v
npm -v
mysql --version
```

---

## 2. Clone the Repository

```bash
git clone https://github.com/aditya-nanda1/medbuy-vendor-app.git
cd medbuy-vendor-app
```

Install frontend dependencies:

```bash
npm install
```

---

## 3. MySQL Server Setup

Start MySQL Server.

Open **MySQL Workbench** or MySQL Command Line.

Create the database:

```sql
CREATE DATABASE medbuy;

USE medbuy;
```

---

## 4. Create Database Tables

Run the following SQL inside MySQL Workbench:

```sql
USE medbuy;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('pharmacy', 'delivery_agent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pharmacies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pharmacy_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE delivery_agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    profile_photo LONGBLOB DEFAULT NULL,
    profile_photo_type VARCHAR(100) DEFAULT NULL,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_delivery_agent_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

Verify the tables:

```sql
USE medbuy;

SHOW TABLES;
```

Expected tables:

```text
users
pharmacies
delivery_agents
password_reset_tokens
```

---

## 5. Backend Setup

Open a new terminal.

From the project root:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

If required packages are missing:

```bash
npm install express cors dotenv mysql2 bcryptjs jsonwebtoken multer
```

---

## 6. Backend Environment Variables

Inside the `backend` folder, create:

```text
.env
```

Add:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=admin123
DB_NAME=medbuy

JWT_SECRET=medbuy_pharmacy_secret_change_this_later
```

Change `DB_PASSWORD` to the MySQL password configured on your laptop.

If MySQL uses port `3306` instead of `3307`, change:

```env
DB_PORT=3306
```

**Do not commit `.env` to GitHub.**

---

## 7. Backend Database Connection

Make sure `backend/db.js` contains:

```js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();

    console.log('✅ MySQL database connected');

    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed');
    console.error(error.message);
  }
}

module.exports = {
  pool,
  testDatabaseConnection,
};
```

---

## 8. Backend Server

Make sure `backend/server.js` registers the required routes:

```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pharmacyRoutes = require('./routes/pharmacyRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const { testDatabaseConnection } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/delivery', deliveryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 MedBuy backend running on port ${PORT}`);

  await testDatabaseConnection();
});
```

---

## 9. Delivery Routes

Make sure `backend/routes/deliveryRoutes.js` contains:

```js
const express = require('express');
const multer = require('multer');

const {
  registerDeliveryAgent,
  loginDeliveryAgent,
  getDeliveryProfilePhoto,
} = require('../controllers/deliveryController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WEBP images are allowed.'));
    }
  },
});

router.post(
  '/register',
  upload.single('profilePhoto'),
  registerDeliveryAgent
);

router.post(
  '/login',
  loginDeliveryAgent
);

router.get(
  '/profile-photo/:userId',
  getDeliveryProfilePhoto
);

module.exports = router;
```

---

## 10. Start the Backend

Inside the `backend` folder:

```bash
npm start
```

Expected output:

```text
🚀 MedBuy backend running on port 3000
✅ MySQL database connected
```

Keep this terminal running.

---

## 11. Find Your Laptop IP Address

For testing on a physical phone, the phone must connect to the laptop over the local network.

On Windows:

```powershell
ipconfig
```

Find the active network adapter's:

```text
IPv4 Address
```

Example:

```text
192.168.0.101
```

---

## 12. Update the Frontend API URL

The frontend must use the laptop's IP address when running on a physical phone.

Example:

```js
const API_BASE_URL = 'http://192.168.0.101:3000';
```

Replace the IP with the current laptop's IP.

For example:

```js
const API_BASE_URL = 'http://192.168.0.105:3000';
```

### Important

Do **not** use:

```text
http://localhost:3000
```

for a physical phone.

`localhost` on the phone means the phone itself, not the laptop.

---

## 13. Network Requirement

The laptop and phone must be connected to the same Wi-Fi/network.

```text
Laptop
   │
   │ Same Wi-Fi / Network
   │
Phone
```

---

## 14. Test the Backend From the Phone

With the backend running, open the following in the phone's browser:

```text
http://YOUR-LAPTOP-IP:3000
```

Example:

```text
http://192.168.0.101:3000
```

If the phone cannot reach the laptop:

- Check that both devices are on the same Wi-Fi.
- Check the laptop IP.
- Check Windows Firewall.
- Check that the backend is running.
- Check that port `3000` is accessible.

---

## 15. Start the Expo Frontend

Open another terminal.

From the project root:

```bash
npx expo start
```

---

## 16. Run on a Physical Phone

Install **Expo Go** on the phone.

Then run:

```bash
npx expo start
```

Scan the QR code shown in the terminal/browser with Expo Go.

Make sure the laptop and phone are on the same network.

---

## 17. Development OTP

The current development OTP is:

```text
111111
```

---

## 18. .gitignore

Make sure the project `.gitignore` contains:

```gitignore
node_modules/
.env
.expo/
dist/

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

---

## 19. .env.example

Create:

```text
backend/.env.example
```

with:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=medbuy

JWT_SECRET=YOUR_JWT_SECRET
```

Commit `.env.example`, but never commit the real `.env`.

---

## 20. Complete Setup From Scratch

### Step 1 — Clone

```bash
git clone https://github.com/aditya-nanda1/medbuy-vendor-app.git
cd medbuy-vendor-app
```

### Step 2 — Install frontend

```bash
npm install
```

### Step 3 — Create MySQL database

```sql
CREATE DATABASE medbuy;
```

### Step 4 — Create the tables

Run the SQL from the **Create Database Tables** section.

### Step 5 — Install backend

```bash
cd backend
npm install
```

### Step 6 — Create `backend/.env`

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=medbuy

JWT_SECRET=YOUR_JWT_SECRET
```

### Step 7 — Start backend

```bash
npm start
```

Expected:

```text
🚀 MedBuy backend running on port 3000
✅ MySQL database connected
```

### Step 8 — Find laptop IP

```powershell
ipconfig
```

### Step 9 — Update frontend API URL

Example:

```js
const API_BASE_URL = 'http://192.168.0.101:3000';
```

### Step 10 — Start Expo

Open another terminal from the project root:

```bash
npx expo start
```

### Step 11 — Connect phone

Keep the laptop and phone on the same network and open the project using Expo Go.

---

## 21. Troubleshooting

### MySQL connection failed

Check:

```text
MySQL Server is running
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

---

### Phone says Network Request Failed

Check:

```text
Phone and laptop are on the same network
Backend is running
API_BASE_URL uses laptop IP
Port is 3000
Windows Firewall is not blocking Node.js
```

Do not use:

```text
localhost
127.0.0.1
```

in the mobile API URL.

---

### Backend says `pool.query is not a function`

Make sure controllers import the database like this:

```js
const { pool } = require('../db');
```

Not:

```js
const pool = require('../db');
```

---

### Profile photo does not load

Check:

```text
Backend is running
Correct laptop IP is used
User ID exists
delivery_agents record exists
profile_photo contains data
```

---

### Expo dependency errors

From the project root:

```bash
npm install
```

Then:

```bash
npx expo start -c
```

---

## 22. Final Checklist

```text
[ ] Git installed
[ ] Node.js installed
[ ] MySQL Server installed
[ ] MySQL Server running
[ ] medbuy database created
[ ] All four tables created
[ ] backend/.env created
[ ] Backend dependencies installed
[ ] Frontend dependencies installed
[ ] Backend starts successfully
[ ] MySQL connection successful
[ ] Laptop IP identified
[ ] Frontend API URL updated
[ ] Phone and laptop on same network
[ ] Expo Go installed
[ ] npx expo start running
```

---

## Run Commands Summary

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

Open another terminal:

```bash
cd medbuy-vendor-app
npm install
npx expo start
```

### MySQL

```text
Database: medbuy
Port: 3307 (or your local MySQL port)
```

### Phone API

```text
http://YOUR-LAPTOP-IP:3000
```
