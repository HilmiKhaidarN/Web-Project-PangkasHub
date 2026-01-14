const StatisticModel = require('../models/statisticModel');

class StatisticController {
  static async getDashboardStats(req, res) {
    try {
      const stats = await StatisticModel.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil statistik' });
    }
  }
}

module.exports = StatisticController;
