const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateApiKey = require('../utils/apiKey');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

module.exports = {
  // REGISTER
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!JWT_SECRET) {
        return res.status(500).json({ message: 'Konfigurasi server belum lengkap (JWT_SECRET belum diset)' });
      }

      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ message: 'Nama wajib diisi (minimal 2 karakter)' });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Email tidak valid' });
      }

      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password wajib diisi (minimal 6 karakter)' });
      }

      const normalizedEmail = normalizeEmail(email);

      const existingUser = await User.findOne({ where: { email: normalizedEmail } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const apiKey = generateApiKey();

      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        api_key: apiKey,
        api_key_status: true
      });

      res.status(201).json({
        message: 'Registrasi berhasil',
        api_key: apiKey
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // LOGIN
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!JWT_SECRET) {
        return res.status(500).json({ message: 'Konfigurasi server belum lengkap (JWT_SECRET belum diset)' });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Email tidak valid' });
      }

      if (typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({ message: 'Password wajib diisi' });
      }

      const normalizedEmail = normalizeEmail(email);

      const user = await User.findOne({ where: { email: normalizedEmail } });
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Password salah' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Login berhasil',
        token,
        role: user.role,
        api_key: user.api_key,
        api_key_status: user.api_key_status
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ✅ USER: REGENERATE API KEY
  regenerateMyApiKey: async (req, res) => {
    
    try {
      const userId = req.user.id;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      // Cek apakah API key diizinkan untuk diregenerasi (status aktif)
      if (!user.api_key_status) {
        return res.status(403).json({ message: 'API Key Anda dinonaktifkan oleh admin. Tidak dapat regenerate hingga diaktifkan kembali.' });
      }

      const newApiKey = generateApiKey();

      await User.update(
        { 
          api_key: newApiKey,
          api_key_status: true
        },
        { where: { id: userId } }
      );

      res.json({
        status: 'Success',
        message: 'API Key baru berhasil dibuat',
        api_key: newApiKey
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ✅ ADMIN: RESET API KEY USER
  resetUserApiKey: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      if (user.role === 'admin') {
        return res.status(403).json({ 
          message: 'Tidak dapat mereset API Key admin' 
        });
      }

      const newApiKey = generateApiKey();

      await User.update(
        { 
          api_key: newApiKey,
          api_key_status: true
        },
        { where: { id: userId } }
      );

      res.json({
        status: 'Success',
        message: `API Key user ${user.name} berhasil direset`,
        data: {
          user_id: user.id,
          name: user.name,
          email: user.email,
          new_api_key: newApiKey
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};