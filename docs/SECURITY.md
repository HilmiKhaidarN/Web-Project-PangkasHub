# Security Policy - PangkasHub

## ⚠️ Peringatan Keamanan

Aplikasi ini menyimpan data sensitif customer. Harap perhatikan panduan keamanan berikut:

## 🔒 Keamanan Database

### Password Database
- **JANGAN** gunakan password kosong di production
- Gunakan password yang kuat (minimal 16 karakter)
- Kombinasi huruf besar, kecil, angka, dan simbol
- Ganti password secara berkala (setiap 3-6 bulan)

### Backup Database
```bash
# Backup manual
mysqldump -u root -p pangkashub > backup_$(date +%Y%m%d).sql

# Restore
mysql -u root -p pangkashub < backup_20250114.sql
```

## 🔐 Keamanan Aplikasi

### 1. Session Secret
File: `.env`
```env
SESSION_SECRET=ganti-dengan-string-random-minimal-32-karakter
```

Generate random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Password Admin Default
**WAJIB DIGANTI SETELAH INSTALASI!**

Default:
- Username: `admin`
- Password: `admin123`

Ganti dengan:
```bash
npm run create-admin username_baru password_kuat "Nama Admin"
```

### 3. HTTPS
**Production WAJIB menggunakan HTTPS!**

Setup dengan Nginx:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛡️ Best Practices

### 1. Environment Variables
- Jangan commit file `.env` ke Git
- Setiap environment punya `.env` sendiri
- Gunakan `.env.example` sebagai template

### 2. Rate Limiting
Tambahkan rate limiting untuk mencegah brute force:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // max 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Input Validation
- Semua input user sudah divalidasi
- Prepared statements untuk mencegah SQL injection
- XSS protection dengan sanitization

### 4. CORS
Production harus specify origin:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### 5. Helmet.js
Tambahkan security headers:
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

## 📊 Monitoring

### 1. Logs
- Monitor error logs secara real-time
- Setup log rotation
- Gunakan logging service (Winston, Morgan)

### 2. Database
- Monitor query performance
- Setup slow query log
- Regular database optimization

### 3. Server
- Monitor CPU & Memory usage
- Setup alerts untuk downtime
- Regular security updates

## 🚨 Reporting Security Issues

Jika menemukan security vulnerability:

1. **JANGAN** buat public issue di GitHub
2. Email ke: [your-security-email]
3. Berikan detail lengkap tentang vulnerability
4. Tunggu response dalam 48 jam

## 📋 Security Checklist

Sebelum deploy production:

- [ ] Ganti password admin default
- [ ] Generate SESSION_SECRET yang kuat
- [ ] Setup HTTPS dengan SSL certificate
- [ ] Konfigurasi firewall
- [ ] Setup backup database otomatis
- [ ] Aktifkan rate limiting
- [ ] Install Helmet.js
- [ ] Konfigurasi CORS dengan origin spesifik
- [ ] Setup monitoring & alerts
- [ ] Test security dengan penetration testing
- [ ] Review & update dependencies (npm audit)
- [ ] Setup log rotation
- [ ] Dokumentasi disaster recovery plan

## 🔄 Regular Maintenance

### Mingguan
- Review error logs
- Check disk space
- Monitor performance

### Bulanan
- Update dependencies
- Review access logs
- Database optimization
- Security audit

### 3 Bulan
- Ganti password database
- Review user permissions
- Update SSL certificates (jika perlu)

## 📞 Support

Untuk pertanyaan keamanan:
- Developer: hello-hilmi
- Documentation: README.md

---

**Remember**: Security is not a one-time setup, it's an ongoing process!

© 2025 PangkasHub - Developed by hello-hilmi
