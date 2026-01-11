const { Loan, User } = require('../models');
const googleBooksService = require('../services/googleBooksService');

module.exports = {
  // ==========================================
  // USER: MEMINJAM BUKU (Pakai API Key Personal)
  // ==========================================
  createLoan: async (req, res) => {
    try {
      const userId = req.user.id; // Dari apiKeyAuth middleware
      const { book_id, loan_date, due_date, notes } = req.body;

      // Validasi input
      if (!book_id || !loan_date || !due_date) {
        return res.status(400).json({
          status: 'Error',
          message: 'book_id, loan_date, dan due_date wajib diisi'
        });
      }

      // ✅ Ambil detail buku dari Google Books API
      const bookResult = await googleBooksService.getBookById(book_id);

      if (!bookResult.success) {
        return res.status(404).json({
          status: 'Error',
          message: 'Buku tidak ditemukan di Google Books API'
        });
      }

      const bookData = bookResult.data;

      // ✅ Cek apakah user sudah pinjam buku yang sama dan belum dikembalikan
      const existingLoan = await Loan.findOne({
        where: {
          user_id: userId,
          book_id: book_id,
          status: ['pending', 'dipinjam']
        }
      });

      if (existingLoan) {
        return res.status(400).json({
          status: 'Error',
          message: 'Anda sudah meminjam buku ini dan belum mengembalikannya'
        });
      }

      // ✅ Simpan peminjaman dengan status 'pending' (menunggu approval admin)
      const loan = await Loan.create({
        user_id: userId,
        book_id: book_id,
        book_title: bookData.title,
        book_author: bookData.authors.join(', ') || 'Unknown',
        book_thumbnail: bookData.thumbnail,
        loan_date: loan_date,
        due_date: due_date,
        status: 'pending',
        notes: notes || null
      });

      res.status(201).json({
        status: 'Success',
        message: 'Peminjaman berhasil diajukan. Menunggu approval admin.',
        data: {
          loan_id: loan.id,
          book_title: loan.book_title,
          book_author: loan.book_author,
          loan_date: loan.loan_date,
          due_date: loan.due_date,
          status: loan.status
        }
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  // ==========================================
  // USER: LIHAT PEMINJAMAN SAYA (Pakai API Key Personal)
  // ==========================================
  getMyLoans: async (req, res) => {
    try {
      // Middleware apiKeyAuth sudah menjamin req.user ada
      const userId = req.user.id;
      const { status } = req.query; // Optional filter by status

      const whereClause = { user_id: userId };
      if (status) {
        whereClause.status = status;
      }

      const loans = await Loan.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });

      res.json({
        status: 'Success',
        message: 'Daftar peminjaman Anda',
        user: req.user.name,
        total: loans.length,
        data: loans
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  // ==========================================
  // ADMIN: LIHAT SEMUA PEMINJAMAN (JWT Admin)
  // ==========================================
  getAllLoans: async (req, res) => {
    try {
      const { status, user_id } = req.query;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (user_id) whereClause.user_id = user_id;

      const loans = await Loan.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        status: 'Success',
        message: 'Daftar semua peminjaman',
        total: loans.length,
        data: loans
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  // ==========================================
  // ADMIN: APPROVE PEMINJAMAN (JWT Admin)
  // ==========================================
  approveLoan: async (req, res) => {
    try {
      const { id } = req.params;

      const loan = await Loan.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
      });

      if (!loan) {
        return res.status(404).json({
          status: 'Error',
          message: 'Peminjaman tidak ditemukan'
        });
      }

      if (loan.status !== 'pending') {
        return res.status(400).json({
          status: 'Error',
          message: `Peminjaman sudah dalam status: ${loan.status}`
        });
      }

      // Update status ke 'dipinjam'
      loan.status = 'dipinjam';
      await loan.save();

      res.json({
        status: 'Success',
        message: 'Peminjaman berhasil disetujui',
        data: {
          loan_id: loan.id,
          user: loan.user.name,
          book_title: loan.book_title,
          status: loan.status
        }
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  // ==========================================
  // ADMIN: REJECT PEMINJAMAN (JWT Admin)
  // ==========================================
  rejectLoan: async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const loan = await Loan.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
      });

      if (!loan) {
        return res.status(404).json({
          status: 'Error',
          message: 'Peminjaman tidak ditemukan'
        });
      }

      if (loan.status !== 'pending') {
        return res.status(400).json({
          status: 'Error',
          message: `Peminjaman sudah dalam status: ${loan.status}`
        });
      }

      // Hapus peminjaman (atau bisa update status jadi 'rejected')
      if (notes) {
        loan.notes = notes;
        await loan.save();
      }
      
      await loan.destroy();

      res.json({
        status: 'Success',
        message: 'Peminjaman berhasil ditolak dan dihapus',
        data: {
          loan_id: loan.id,
          user: loan.user.name,
          book_title: loan.book_title
        }
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  // ==========================================
  // ADMIN: KEMBALIKAN BUKU (JWT Admin)
  // ==========================================
  returnBook: async (req, res) => {
    try {
      const { id } = req.params;
      // Ubah baris ini di loanController.js
      const { return_date, notes } = req.body || {};

      const loan = await Loan.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
      });

      if (!loan) {
        return res.status(404).json({
          status: 'Error',
          message: 'Peminjaman tidak ditemukan'
        });
      }

      if (loan.status === 'dikembalikan') {
        return res.status(400).json({
          status: 'Error',
          message: 'Buku sudah dikembalikan sebelumnya'
        });
      }

      if (loan.status !== 'dipinjam') {
        return res.status(400).json({
          status: 'Error',
          message: `Peminjaman dalam status: ${loan.status}. Hanya buku yang dipinjam yang bisa dikembalikan.`
        });
      }

      // Update status
      loan.status = 'dikembalikan';
      loan.return_date = return_date || new Date().toISOString().split('T')[0];
      if (notes) loan.notes = notes;

      await loan.save();

      res.json({
        status: 'Success',
        message: 'Buku berhasil dikembalikan',
        data: {
          loan_id: loan.id,
          user: loan.user.name,
          book_title: loan.book_title,
          loan_date: loan.loan_date,
          due_date: loan.due_date,
          return_date: loan.return_date,
          status: loan.status
        }
      });

    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: error.message
      });
    }
  },

  // ==========================================
  // ADMIN: GET STATISTIK PEMINJAMAN (JWT Admin)
  // ==========================================
  getLoanStatistics: async (req, res) => {
    try {
      const { Sequelize } = require('../models');

      const stats = await Loan.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      const totalLoans = await Loan.count();
      const activeLoans = await Loan.count({ where: { status: 'dipinjam' } });
      const pendingLoans = await Loan.count({ where: { status: 'pending' } });
      const returnedLoans = await Loan.count({ where: { status: 'dikembalikan' } });

      res.json({
        status: 'Success',
        message: 'Statistik peminjaman',
        data: {
          total_loans: totalLoans,
          active_loans: activeLoans,
          pending_loans: pendingLoans,
          returned_loans: returnedLoans,
          by_status: stats
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