const AdminModel = require('../models/adminModel');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password harus diisi' });
      }

      const admin = await AdminModel.findByUsername(username);
      
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }

      const isValidPassword = await AdminModel.verifyPassword(password, admin.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }

      // Set session
      req.session.adminId = admin.id;
      req.session.adminName = admin.name;
      req.session.username = admin.username;
      req.session.role = 'admin';

      res.json({ 
        success: true, 
        message: 'Login berhasil',
        data: {
          name: admin.name,
          username: admin.username
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Gagal logout' });
        }
        res.json({ success: true, message: 'Logout berhasil' });
      });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }

  static async checkAuth(req, res) {
    if (req.session.adminId) {
      res.json({ 
        success: true, 
        authenticated: true,
        data: {
          name: req.session.adminName,
          username: req.session.username
        }
      });
    } else {
      res.json({ success: true, authenticated: false });
    }
  }
}

module.exports = AuthController;
