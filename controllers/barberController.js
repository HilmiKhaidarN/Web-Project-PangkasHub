const BarberModel = require('../models/barberModel');

class BarberController {
  static async getAll(req, res) {
    try {
      const barbers = await BarberModel.getAll();
      res.json({ success: true, data: barbers });
    } catch (error) {
      console.error('Error fetching barbers:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data barber' });
    }
  }

  static async create(req, res) {
    try {
      const { name, phone } = req.body;
      
      if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Nama dan telepon harus diisi' });
      }
      
      const barberId = await BarberModel.create({ name, phone });
      const barber = await BarberModel.getById(barberId);
      
      res.status(201).json({ success: true, message: 'Barber berhasil ditambahkan', data: barber });
    } catch (error) {
      console.error('Error creating barber:', error);
      res.status(500).json({ success: false, message: 'Gagal menambahkan barber' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, is_active } = req.body;
      
      const updated = await BarberModel.update(id, { name, phone, is_active });
      
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Barber tidak ditemukan' });
      }
      
      const barber = await BarberModel.getById(id);
      res.json({ success: true, message: 'Barber berhasil diupdate', data: barber });
    } catch (error) {
      console.error('Error updating barber:', error);
      res.status(500).json({ success: false, message: 'Gagal mengupdate barber' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await BarberModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Barber tidak ditemukan' });
      }
      
      res.json({ success: true, message: 'Barber berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting barber:', error);
      res.status(500).json({ success: false, message: 'Gagal menghapus barber' });
    }
  }
}

module.exports = BarberController;
