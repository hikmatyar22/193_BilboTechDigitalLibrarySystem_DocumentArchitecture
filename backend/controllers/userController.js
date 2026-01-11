const { User } = require('../models');

module.exports = {
  // Ambil semua user
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'api_key', 'api_key_status']
      });
      res.json({
        status: "Success",
        message: "Daftar semua user",
        data: users
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Hapus User
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      
      if (user.role === 'admin') {
        return res.status(403).json({ 
          message: 'Tidak dapat menghapus akun admin' 
        });
      }

      await user.destroy();
      res.json({ 
        status: "Success",
        message: 'User berhasil dihapus' 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ✅ Toggle API Key Status (Aktif/Nonaktif)
  toggleApiKeyStatus: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      if (user.role === 'admin') {
        return res.status(403).json({ 
          message: 'Tidak dapat mengubah status API Key admin' 
        });
      }

      // Toggle status
      const newStatus = !user.api_key_status;
      
      await User.update(
        { api_key_status: newStatus },
        { where: { id: user.id } }
      );

      res.json({
        status: "Success",
        message: `API Key berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          api_key_status: newStatus
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};