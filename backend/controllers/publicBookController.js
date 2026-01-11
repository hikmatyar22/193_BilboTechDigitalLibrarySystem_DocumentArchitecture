const googleBooksService = require('../services/googleBooksService');

module.exports = {
  /**
   * Search buku (Public - Tanpa Auth atau pakai Rate Limiting)
   * GET /api/books/search?q=javascript&page=1&limit=20
   */
  searchBooks: async (req, res) => {
    try {
      const { q, page = 1, limit = 20 } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          status: 'Error',
          message: 'Query pencarian (q) wajib diisi'
        });
      }

      const maxResults = parseInt(limit) || 20;
      const startIndex = (parseInt(page) - 1) * maxResults;

      const result = await googleBooksService.searchBooks(q, maxResults, startIndex);

      if (!result.success) {
        return res.status(500).json({
          status: 'Error',
          message: result.message
        });
      }

      res.json({
        status: 'Success',
        message: 'Daftar buku ditemukan',
        query: q,
        page: parseInt(page),
        limit: maxResults,
        totalItems: result.totalItems,
        data: result.items
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  /**
   * Get detail buku berdasarkan ID
   * GET /api/books/:bookId
   */
  getBookDetail: async (req, res) => {
    try {
      const { bookId } = req.params;

      const result = await googleBooksService.getBookById(bookId);

      if (!result.success) {
        return res.status(404).json({
          status: 'Error',
          message: result.message
        });
      }

      res.json({
        status: 'Success',
        message: 'Detail buku ditemukan',
        data: result.data
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  /**
   * Get buku berdasarkan kategori
   * GET /api/books/category/:categoryName?page=1&limit=20
   */
  getBooksByCategory: async (req, res) => {
    try {
      const { categoryName } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const maxResults = parseInt(limit) || 20;
      const startIndex = (parseInt(page) - 1) * maxResults;

      const result = await googleBooksService.getBooksByCategory(
        categoryName,
        maxResults,
        startIndex
      );

      if (!result.success) {
        return res.status(500).json({
          status: 'Error',
          message: result.message
        });
      }

      res.json({
        status: 'Success',
        message: `Daftar buku kategori ${categoryName}`,
        category: categoryName,
        page: parseInt(page),
        limit: maxResults,
        totalItems: result.totalItems,
        data: result.items
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  /**
   * Get daftar kategori populer (Hardcoded)
   * GET /api/books/categories
   */
  getCategories: async (req, res) => {
    try {
      const categories = [
        { id: 'fiction', name: 'Fiksi', description: 'Novel, cerita fiksi' },
        { id: 'science', name: 'Sains', description: 'Buku sains dan penelitian' },
        { id: 'technology', name: 'Teknologi', description: 'Pemrograman, IT, komputer' },
        { id: 'history', name: 'Sejarah', description: 'Sejarah dunia dan lokal' },
        { id: 'business', name: 'Bisnis', description: 'Manajemen, entrepreneurship' },
        { id: 'self-help', name: 'Pengembangan Diri', description: 'Motivasi, produktivitas' },
        { id: 'religion', name: 'Religi', description: 'Buku keagamaan' },
        { id: 'children', name: 'Anak-anak', description: 'Buku untuk anak' },
        { id: 'education', name: 'Pendidikan', description: 'Buku pelajaran, akademik' },
        { id: 'art', name: 'Seni', description: 'Seni, desain, fotografi' }
      ];

      res.json({
        status: 'Success',
        message: 'Daftar kategori buku',
        data: categories
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  /**
   * Get statistik total buku keseluruhan dari Google Books API
   * GET /api/books/statistics
   */
  getBookStatistics: async (req, res) => {
    try {
      // Search dengan query kosong untuk mendapatkan estimasi total buku
      // Menggunakan beberapa kategori populer untuk mendapatkan perkiraan yang lebih baik
      const categories = ['fiction', 'technology', 'science', 'business', 'history'];
      let totalBooks = 0;
      let categoryStats = [];

      for (const category of categories) {
        try {
          const result = await googleBooksService.getBooksByCategory(category, 1, 0);
          if (result.success && result.totalItems) {
            totalBooks += result.totalItems;
            categoryStats.push({
              category: category,
              count: result.totalItems
            });
          }
        } catch (err) {
          console.log(`Failed to get stats for ${category}:`, err.message);
        }
      }

      // Jika tidak berhasil mendapatkan data, gunakan estimasi
      if (totalBooks === 0) {
        totalBooks = 40000000; // Estimasi 40 juta buku di Google Books
      }

      // Hitung rata-rata per kategori
      const avgPerCategory = Math.floor(totalBooks / categories.length);

      res.json({
        status: 'Success',
        message: 'Statistik total buku keseluruhan',
        data: {
          totalBooks: totalBooks,
          estimatedCategories: categories.length,
          averagePerCategory: avgPerCategory,
          categoryBreakdown: categoryStats,
          lastUpdated: new Date().toISOString(),
          source: 'Google Books API'
        }
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  }
};