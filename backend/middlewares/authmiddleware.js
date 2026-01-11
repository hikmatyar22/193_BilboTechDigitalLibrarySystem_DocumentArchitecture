const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!JWT_SECRET) {
      return res.status(500).json({ message: 'Konfigurasi server belum lengkap (JWT_SECRET belum diset)' });
    }

    if (!authHeader) {
      return res.status(401).json({ message: 'Token tidak ada' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User tidak valid' });
    }

    req.user = user; // 🔑 simpan user login
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};
