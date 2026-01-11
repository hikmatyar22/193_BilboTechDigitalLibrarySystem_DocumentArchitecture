const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authmiddleware');
const adminAuth = require('../middlewares/adminAuth');

// Admin lihat semua user
router.get('/', authMiddleware, adminAuth, userController.getAllUsers);

// Admin hapus user
router.delete('/:id', authMiddleware, adminAuth, userController.deleteUser);

// ✅ Admin toggle status API Key user (aktif/nonaktif)
router.patch('/:id/toggle-api-key', authMiddleware, adminAuth, userController.toggleApiKeyStatus);

module.exports = router;