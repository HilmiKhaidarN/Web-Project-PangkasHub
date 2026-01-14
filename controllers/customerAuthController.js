const CustomerModel = require('../models/customerModel');

class CustomerAuthController {
  static async register(req, res) {
    try {
      const { name, phone, email, password } = req.body;

      // Validasi input
      if (!name || !phone || !password) {
        return res.status(400).json({ success: false, message: 'Nama, telepon, dan password harus diisi' });
      }

      // Validasi format telepon
      if (!/^08\d{8,11}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Format nomor telepon tidak valid (08xxxxxxxxxx)' });
      }

      // Validasi email jika diisi
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Format email tidak valid' });
      }

      // Cek apakah telepon sudah terdaftar
      const existingCustomer = await CustomerModel.findByPhone(phone);
      if (existingCustomer) {
        return res.status(409).json({ success: false, message: 'Nomor telepon sudah terdaftar' });
      }

      // Cek apakah email sudah terdaftar (jika diisi)
      if (email) {
        const existingEmail = await CustomerModel.findByEmail(email);
        if (existingEmail) {
          return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
        }
      }

      // Buat customer baru
      const customerId = await CustomerModel.create({ name, phone, email, password });

      // Tidak set session, biarkan user login manual
      res.status(201).json({ 
        success: true, 
        message: 'Registrasi berhasil! Silakan login dengan akun Anda.',
        data: {
          id: customerId,
          name,
          phone,
          email
        }
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }

  static async login(req, res) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ success: false, message: 'Telepon dan password harus diisi' });
      }

      const customer = await CustomerModel.findByPhone(phone);
      
      if (!customer) {
        return res.status(401).json({ success: false, message: 'Nomor telepon atau password salah' });
      }

      const isValidPassword = await CustomerModel.verifyPassword(password, customer.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Nomor telepon atau password salah' });
      }

      // Set session
      req.session.customerId = customer.id;
      req.session.customerName = customer.name;
      req.session.customerPhone = customer.phone;
      req.session.role = 'customer';

      res.json({ 
        success: true, 
        message: 'Login berhasil',
        data: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        }
      });
    } catch (error) {
      console.error('Error during customer login:', error);
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
    if (req.session.customerId) {
      const customer = await CustomerModel.getById(req.session.customerId);
      res.json({ 
        success: true, 
        authenticated: true,
        data: customer
      });
    } else {
      res.json({ success: true, authenticated: false });
    }
  }

  static async getProfile(req, res) {
    try {
      const customer = await CustomerModel.getById(req.session.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });
      }
      res.json({ success: true, data: customer });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }
}

module.exports = CustomerAuthController;
