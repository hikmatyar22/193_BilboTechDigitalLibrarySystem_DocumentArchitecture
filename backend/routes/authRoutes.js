const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authmiddleware');
const adminAuth = require('../middlewares/adminAuth');

// ==========================================
// PUBLIC ROUTES (No Auth Required)
// ==========================================
router.post('/register', authController.register);
router.post('/login', authController.login);

// ==========================================
// USER ROUTES (Require JWT)
// ==========================================
// ✅ User regenerate API key sendiri
router.post('/regenerate-api-key', authMiddleware, authController.regenerateMyApiKey);

// ==========================================
// ADMIN ROUTES (Require JWT + Admin Role)
// ==========================================
// ✅ Admin reset API key user tertentu - PERBAIKI URUTAN INI!
// HARUS DI BAWAH /regenerate-api-key agar tidak bentrok
router.post('/reset-api-key/:userId', authMiddleware, adminAuth, authController.resetUserApiKey);

module.exports = router;