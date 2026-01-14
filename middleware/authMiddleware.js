function requireAuth(req, res, next) {
  if (req.session && req.session.adminId && req.session.role === 'admin') {
    return next();
  }
  
  res.status(401).json({ 
    success: false, 
    message: 'Unauthorized. Silakan login sebagai admin terlebih dahulu.',
    requireAuth: true
  });
}

function requireCustomerAuth(req, res, next) {
  if (req.session && req.session.customerId && req.session.role === 'customer') {
    return next();
  }
  
  res.status(401).json({ 
    success: false, 
    message: 'Unauthorized. Silakan login terlebih dahulu.',
    requireAuth: true
  });
}

function optionalCustomerAuth(req, res, next) {
  // Middleware ini tidak memblokir, hanya menambahkan info customer jika ada
  next();
}

module.exports = { requireAuth, requireCustomerAuth, optionalCustomerAuth };
