# 🚀 Panduan Deploy PangkasHub ke Vercel

## ⚠️ PENTING - Batasan Vercel

Vercel adalah platform untuk **serverless functions** dan **static sites**. Aplikasi PangkasHub memiliki beberapa komponen yang **TIDAK COMPATIBLE** dengan Vercel:

### ❌ Yang TIDAK Bisa di Vercel:
1. **MySQL Database** - Vercel tidak menyediakan MySQL hosting
2. **Socket.IO** - WebSocket tidak fully supported di serverless
3. **Session Storage** - Serverless functions stateless
4. **Long-running processes** - Timeout 10 detik

### ✅ Solusi Alternatif:

---

## 🎯 OPSI 1: Deploy ke Platform yang Tepat (RECOMMENDED)

### A. Railway.app (Paling Mudah)
**Kelebihan:**
- ✅ Support Node.js + MySQL
- ✅ Support WebSocket/Socket.IO
- ✅ Free tier tersedia
- ✅ Auto-deploy dari GitHub
- ✅ Built-in database

**Cara Deploy:**
1. Buka https://railway.app
2. Sign up dengan GitHub
3. New Project → Deploy from GitHub repo
4. Pilih repository: Web-Project-PangkasHub
5. Add MySQL database dari Railway
6. Set environment variables
7. Deploy!

**Environment Variables di Railway:**
```
PORT=3000
DB_HOST=<railway-mysql-host>
DB_USER=root
DB_PASSWORD=<railway-mysql-password>
DB_NAME=pangkashub
DB_PORT=3306
SESSION_SECRET=<generate-random-string>
NODE_ENV=production
```

---

### B. Render.com (Gratis & Mudah)
**Kelebihan:**
- ✅ Free tier permanent
- ✅ Support Node.js + PostgreSQL/MySQL
- ✅ Support WebSocket
- ✅ Auto-deploy dari GitHub

**Cara Deploy:**
1. Buka https://render.com
2. Sign up dengan GitHub
3. New → Web Service
4. Connect repository
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add PostgreSQL database (atau external MySQL)
8. Set environment variables
9. Deploy!

---

### C. Heroku (Populer)
**Kelebihan:**
- ✅ Support semua fitur
- ✅ Add-ons untuk database
- ✅ Mature platform

**Cara Deploy:**
1. Install Heroku CLI
2. `heroku login`
3. `heroku create pangkashub`
4. `heroku addons:create jawsdb:kitefin` (MySQL)
5. Set config vars
6. `git push heroku main`

---

### D. DigitalOcean App Platform
**Kelebihan:**
- ✅ Full control
- ✅ Managed database
- ✅ Scalable

**Cara Deploy:**
1. Buka https://cloud.digitalocean.com
2. Create App
3. Connect GitHub
4. Add Managed Database (MySQL)
5. Configure & Deploy

---

## 🔧 OPSI 2: Modifikasi untuk Vercel (Tidak Recommended)

Jika tetap ingin deploy ke Vercel, perlu modifikasi besar:

### Perubahan yang Diperlukan:

1. **Database → Serverless Database**
   - Ganti MySQL dengan PlanetScale (MySQL serverless)
   - Atau gunakan Supabase (PostgreSQL)
   - Atau MongoDB Atlas

2. **Session → JWT Token**
   - Ganti express-session dengan JWT
   - Store token di localStorage/cookie

3. **Socket.IO → Polling/SSE**
   - Ganti real-time dengan polling
   - Atau gunakan Pusher/Ably

4. **File Structure**
   - Pindah routes ke `/api` folder
   - Setiap route jadi serverless function

### Contoh Struktur Vercel:
```
/api
  /auth
    login.js
    logout.js
  /bookings
    index.js
    [id].js
  /services
    index.js
/public
  index.html
  ...
vercel.json
```

**Ini memerlukan rewrite hampir seluruh aplikasi!**

---

## 📋 REKOMENDASI DEPLOYMENT

### Untuk PangkasHub, gunakan:

**1. Railway.app** ⭐⭐⭐⭐⭐
- Paling mudah
- Support semua fitur
- Free tier cukup
- Auto-deploy

**2. Render.com** ⭐⭐⭐⭐
- Free permanent
- Good performance
- Easy setup

**3. Heroku** ⭐⭐⭐⭐
- Mature platform
- Banyak add-ons
- Paid setelah free tier

**4. DigitalOcean** ⭐⭐⭐
- Full control
- Scalable
- Paid dari awal

**❌ Vercel** - Tidak cocok untuk aplikasi ini

---

## 🚀 Quick Start: Deploy ke Railway (5 Menit)

### Step 1: Persiapan
```bash
# Pastikan code sudah di GitHub
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Railway Setup
1. Buka https://railway.app
2. Login dengan GitHub
3. Klik "New Project"
4. Pilih "Deploy from GitHub repo"
5. Authorize Railway
6. Pilih repository: `Web-Project-PangkasHub`

### Step 3: Add Database
1. Klik "New" → "Database" → "Add MySQL"
2. Database akan auto-provision
3. Copy connection details

### Step 4: Environment Variables
Klik project → Variables → Add:
```
PORT=3000
DB_HOST=<dari-railway-mysql>
DB_USER=root
DB_PASSWORD=<dari-railway-mysql>
DB_NAME=railway
DB_PORT=3306
SESSION_SECRET=<generate-random-32-char>
NODE_ENV=production
```

Generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Setup Database
1. Klik MySQL service → Connect
2. Copy connection command
3. Run locally:
```bash
mysql -h <host> -u root -p<password> railway < database/schema.sql
```

Atau gunakan Railway CLI:
```bash
railway run npm run setup-db
```

### Step 6: Deploy
Railway akan auto-deploy!
- Build: `npm install`
- Start: `npm start`

### Step 7: Create Admin
```bash
railway run npm run create-admin
```

### Step 8: Access
Railway akan berikan URL:
`https://pangkashub-production.up.railway.app`

---

## 🔒 Security Checklist untuk Production

- [ ] Ganti SESSION_SECRET dengan random string
- [ ] Set NODE_ENV=production
- [ ] Ganti password admin default
- [ ] Enable HTTPS (auto di Railway/Render)
- [ ] Set CORS origin ke domain spesifik
- [ ] Review database credentials
- [ ] Backup database
- [ ] Monitor logs
- [ ] Set up error tracking (Sentry)

---

## 📊 Perbandingan Platform

| Feature | Railway | Render | Heroku | Vercel |
|---------|---------|--------|--------|--------|
| Node.js | ✅ | ✅ | ✅ | ✅ |
| MySQL | ✅ | ⚠️ | ✅ | ❌ |
| WebSocket | ✅ | ✅ | ✅ | ⚠️ |
| Session | ✅ | ✅ | ✅ | ❌ |
| Free Tier | ✅ | ✅ | ⚠️ | ✅ |
| Auto Deploy | ✅ | ✅ | ✅ | ✅ |
| Setup Time | 5 min | 10 min | 15 min | N/A |
| **Recommended** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ |

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check environment variables
railway variables

# Test connection
railway run node -e "require('./config/database')"
```

### Port Error
```bash
# Railway auto-assigns PORT
# Make sure server.js uses process.env.PORT
const PORT = process.env.PORT || 3000;
```

### Build Failed
```bash
# Check logs
railway logs

# Common issues:
# - Missing dependencies in package.json
# - Node version mismatch
# - Build timeout
```

### Socket.IO Not Working
```bash
# Check CORS settings in server.js
# Make sure Socket.IO configured for production
```

---

## 📞 Support

**Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

**Render:**
- Docs: https://render.com/docs
- Support: support@render.com

**Heroku:**
- Docs: https://devcenter.heroku.com
- Support: https://help.heroku.com

---

## 🎉 Kesimpulan

**Untuk PangkasHub, JANGAN gunakan Vercel.**

**Gunakan Railway.app:**
1. Sign up di Railway
2. Connect GitHub repo
3. Add MySQL database
4. Set environment variables
5. Deploy!

**Total waktu: ~5-10 menit**

**URL akan jadi:**
`https://pangkashub-production.up.railway.app`

---

**Good luck with deployment! 🚀**

**Developed by: hello-hilmi**
