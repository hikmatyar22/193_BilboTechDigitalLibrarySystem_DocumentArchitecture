const express = require('express');
const router = express.Router();
const publicBookController = require('../controllers/publicBookController');

// ==========================================
// PUBLIC ROUTES - Akses Buku dari Google Books API
// ==========================================

// Get daftar kategori
router.get('/categories', publicBookController.getCategories);

// Search buku
// Contoh: /api/books/search?q=javascript&page=1&limit=20
router.get('/search', publicBookController.searchBooks);

// Get buku by kategori
// Contoh: /api/books/category/technology?page=1&limit=20
router.get('/category/:categoryName', publicBookController.getBooksByCategory);

// Get detail buku by ID
// Contoh: /api/books/gCtazG4ZXlQC
router.get('/:bookId', publicBookController.getBookDetail);

// Get statistik total buku keseluruhan
// Contoh: /api/books/statistics
router.get('/statistics', publicBookController.getBookStatistics);

module.exports = router;