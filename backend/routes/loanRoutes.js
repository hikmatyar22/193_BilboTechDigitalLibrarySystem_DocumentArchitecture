const express = require('express');
const router = express.Router();

const loanController = require('../controllers/loanController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');
const authMiddleware = require('../middlewares/authmiddleware');
const adminAuth = require('../middlewares/adminAuth');

// ==========================================
// USER ROUTES - Menggunakan API Key Personal
// ==========================================

// USER: Membuat peminjaman baru (ajukan peminjaman)
router.post('/', apiKeyAuth, loanController.createLoan);

// USER: Melihat peminjaman milik sendiri
// Optional query: ?status=pending atau ?status=dipinjam
router.get('/my-loans', apiKeyAuth, loanController.getMyLoans);

// ==========================================
// ADMIN ROUTES - Menggunakan JWT
// ==========================================

// ADMIN: Melihat semua peminjaman
// Optional query: ?status=pending&user_id=1
router.get('/all', authMiddleware, adminAuth, loanController.getAllLoans);

// ADMIN: Get statistik peminjaman
router.get('/statistics', authMiddleware, adminAuth, loanController.getLoanStatistics);

// ADMIN: Approve peminjaman (pending -> dipinjam)
router.patch('/:id/approve', authMiddleware, adminAuth, loanController.approveLoan);

// ADMIN: Reject peminjaman (hapus peminjaman)
router.delete('/:id/reject', authMiddleware, adminAuth, loanController.rejectLoan);

// ADMIN: Kembalikan buku (dipinjam -> dikembalikan)
router.patch('/:id/return', authMiddleware, adminAuth, loanController.returnBook);

module.exports = router;