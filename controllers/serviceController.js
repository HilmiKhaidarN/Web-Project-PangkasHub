const ServiceModel = require('../models/serviceModel');

class ServiceController {
  static async getAll(req, res) {
    try {
      const services = await ServiceModel.getAll();
      res.json({ success: true, data: services });
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data layanan' });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, duration, price } = req.body;
      
      if (!name || !duration || !price) {
        return res.status(400).json({ success: false, message: 'Nama, durasi, dan harga harus diisi' });
      }
      
      const serviceId = await ServiceModel.create({ name, description, duration, price });
      const service = await ServiceModel.getById(serviceId);
      
      res.status(201).json({ success: true, message: 'Layanan berhasil ditambahkan', data: service });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ success: false, message: 'Gagal menambahkan layanan' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, duration, price } = req.body;
      
      const updated = await ServiceModel.update(id, { name, description, duration, price });
      
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
      }
      
      const service = await ServiceModel.getById(id);
      res.json({ success: true, message: 'Layanan berhasil diupdate', data: service });
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ success: false, message: 'Gagal mengupdate layanan' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await ServiceModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
      }
      
      res.json({ success: true, message: 'Layanan berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ success: false, message: 'Gagal menghapus layanan' });
    }
  }
}

module.exports = ServiceController;
