const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());

// ============================================
// LOAD ROUTES
// ============================================
console.log('📦 Loading routes...');

// AUTH
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ authRoutes loaded');
} catch (e) {
  console.error('❌ authRoutes error:', e.message);
}

// PUBLIC BOOKS (Google Books API)
try {
  const bookRoutes = require('./routes/bookRoutes');
  app.use('/api/books', bookRoutes);
  console.log('✅ bookRoutes (Public) loaded');
} catch (e) {
  console.error('❌ bookRoutes error:', e.message);
}

// LOANS (User API Key + Admin JWT)
try {
  const loanRoutes = require('./routes/loanRoutes');
  app.use('/api/loans', loanRoutes);
  console.log('✅ loanRoutes loaded');
} catch (e) {
  console.error('❌ loanRoutes error:', e.message);
}

// USER MANAGEMENT (ADMIN)
try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/admin/users', userRoutes);
  console.log('✅ userRoutes (Admin) loaded');
} catch (e) {
  console.error('❌ userRoutes error:', e.message);
}

// TEST ROUTES
try {
  const testRoutes = require('./routes/testRoutes');
  app.use('/api/test', testRoutes);
  console.log('✅ testRoutes loaded');
} catch (e) {
  console.error('❌ testRoutes error:', e.message);
}

console.log('✅ All routes loaded!\n');

// ============================================
// SERVE FRONTEND (STATIC ONLY — TANPA WILDCARD)
// ============================================
app.use(express.static(path.join(__dirname, '../frontend')));

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ============================================
// 404 API HANDLER
// ============================================
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'Error',
    message: 'API endpoint not found'
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  const message = status >= 500 ? 'Terjadi kesalahan pada server' : (err?.message || 'Terjadi kesalahan');
  res.status(status).json({ message });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);

  console.log(`
🚀 API READY:
- Books (Public): http://localhost:${PORT}/api/books
- Loans:          http://localhost:${PORT}/api/loans
- Auth:           http://localhost:${PORT}/api/auth
  `);

  try {
    const open = (await import('open')).default;
    await open(`http://localhost:${PORT}/index.html`);
  } catch {
    // Auto-open optional
  }
});
