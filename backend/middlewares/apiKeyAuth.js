const { User } = require('../models');
const { validateApiKeyFormat } = require('../utils/apiKey');

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ message: 'API Key diperlukan di header x-api-key' });
    }

    const formatCheck = validateApiKeyFormat(apiKey);
    if (!formatCheck.ok) {
      return res.status(400).json({ message: formatCheck.message });
    }

    // Cari user berdasarkan API key
    const user = await User.findOne({ where: { api_key: apiKey } });

    if (!user) {
      return res.status(403).json({ message: 'API Key tidak valid atau tidak terdaftar' });
    }

    if (user.api_key_status === false) {
      return res.status(403).json({ message: 'API Key ini telah dinonaktifkan oleh Admin' });
    }

    // Cek apakah user yang login sama dengan pemilik API key
    // Untuk mencegah user A mengakses data user B
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Jika user yang login (dari JWT) berbeda dengan pemilik API key
        if (decoded.id !== user.id) {
          return res.status(403).json({ 
            message: 'Akses ditolak. Anda tidak dapat menggunakan API Key milik user lain.' 
          });
        }
      } catch (jwtError) {
        // JWT tidak valid, lanjutkan tanpa cek user match
      }
    }

    // Simpan user ke req.user agar controller tahu siapa yang punya API key
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};