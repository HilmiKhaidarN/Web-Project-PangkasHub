# PangkasHub - Aplikasi Booking Barbershop

Aplikasi web booking barbershop dengan arsitektur client-server menggunakan HTML, CSS, JavaScript murni untuk frontend dan Node.js + Express + MySQL untuk backend.

## Fitur Utama

- **Registrasi Wajib**: Customer harus registrasi dan login sebelum bisa booking
- **Sistem Booking**: Pelanggan dapat memilih layanan, barber (opsional), tanggal, dan slot waktu
- **Riwayat Booking**: Customer yang login dapat melihat riwayat booking mereka
- **Validasi Double Booking**: Backend mencegah konflik jadwal berdasarkan barber dan waktu
- **Slot Waktu Dinamis**: Hanya menampilkan slot yang tersedia
- **Autentikasi Admin**: Login dengan session-based authentication (akun sudah disediakan)
- **Dashboard Admin**: Kelola booking, filter berdasarkan tanggal/barber, update status (protected)
- **Status Booking**: pending, confirmed, completed, cancelled
- **Dual Role System**: Admin (tidak bisa registrasi) dan Customer (wajib registrasi)

## Struktur Proyek

```
pangkashub/
├── config/
│   └── database.js          # Konfigurasi koneksi MySQL
├── controllers/
│   ├── barberController.js  # Logic barber
│   ├── bookingController.js # Logic booking
│   └── serviceController.js # Logic layanan
├── models/
│   ├── barberModel.js       # Model barber
│   ├── bookingModel.js      # Model booking
│   └── serviceModel.js      # Model layanan
├── routes/
│   ├── barberRoutes.js      # Endpoint barber
│   ├── bookingRoutes.js     # Endpoint booking
│   └── serviceRoutes.js     # Endpoint layanan
├── public/
│   ├── css/
│   │   └── style.css        # Styling
│   ├── js/
│   │   ├── booking.js       # Frontend booking
│   │   └── admin.js         # Frontend admin
│   ├── index.html           # Halaman booking
│   └── admin.html           # Dashboard admin
├── database/
│   └── schema.sql           # Database schema
├── server.js                # Entry point
├── package.json
└── .env.example
```

## Instalasi

1. **Clone atau download project**

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
   - Buat database MySQL
   - Import schema dari `database/schema.sql`
   - Atau jalankan manual:
```bash
mysql -u root -p < database/schema.sql
```

4. **Konfigurasi environment**
   - Copy `.env.example` ke `.env`
   - Sesuaikan konfigurasi database:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pangkashub
DB_PORT=3306
```

5. **Jalankan aplikasi**
```bash
npm start
```

Atau untuk development dengan auto-reload:
```bash
npm run dev
```

6. **Buat akun admin**
```bash
npm run create-admin
```
   Atau dengan custom data:
```bash
npm run create-admin username password "Nama Admin"
```

7. **Akses aplikasi**
   - **Registrasi Customer** (Wajib): http://localhost:3000/register
   - **Login Customer**: http://localhost:3000/customer-login
   - **Booking**: http://localhost:3000 (harus login terlebih dahulu)
   - **Riwayat Booking**: http://localhost:3000/my-bookings (setelah login customer)
   - **Login Admin**: http://localhost:3000/login
   - **Dashboard Admin**: http://localhost:3000/admin (setelah login admin)

**Default Admin:**
- Username: `admin`
- Password: `admin123`

**Customer:**
- Wajib registrasi terlebih dahulu di `/register`
- Login menggunakan nomor telepon dan password
- Setelah login baru bisa melakukan booking

## API Endpoints

### Auth (Admin)
- `POST /api/auth/login` - Login admin
- `POST /api/auth/logout` - Logout admin
- `GET /api/auth/check` - Cek status autentikasi admin

### Customer Auth
- `POST /api/customer-auth/register` - Registrasi customer baru
- `POST /api/customer-auth/login` - Login customer
- `POST /api/customer-auth/logout` - Logout customer
- `GET /api/customer-auth/check` - Cek status autentikasi customer
- `GET /api/customer-auth/profile` - Get profile customer (🔒 Protected)

### Services
- `GET /api/services` - Ambil semua layanan

### Barbers
- `GET /api/barbers` - Ambil semua barber aktif

### Bookings
- `GET /api/bookings/available-slots?date=YYYY-MM-DD&barber_id=X` - Ambil slot tersedia
- `GET /api/bookings?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&barber_id=X` - Ambil booking (🔒 Admin)
- `GET /api/bookings/my-bookings` - Ambil booking customer (🔒 Customer)
- `POST /api/bookings` - Buat booking baru (🔒 Customer - Wajib Login)
- `PATCH /api/bookings/:id/status` - Update status booking (🔒 Admin)

## Keamanan

- Session-based authentication untuk admin
- Password hashing dengan bcrypt
- Protected routes dengan middleware autentikasi
- Validasi input di backend
- CORS dengan credentials support
- Prepared statements untuk query database (mencegah SQL injection)
- Validasi konflik jadwal
- HTTP-only cookies untuk session

## Pengembangan Lanjutan

Aplikasi ini dirancang untuk mudah dikembangkan dengan fitur tambahan:

- Notifikasi (email/SMS) saat booking dibuat/diupdate
- Laporan dan statistik
- Sistem autentikasi admin
- Upload foto hasil cukuran
- Rating dan review
- Integrasi payment gateway
- Reminder otomatis

## Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Architecture**: REST API, MVC Pattern

## Lisensi

**License**: hello-hilmi

## ⚠️ PERINGATAN / WARNING

**PENTING - HARAP DIBACA:**

1. **Keamanan Database**
   - Jangan gunakan password database kosong di production
   - Ganti SESSION_SECRET dengan string random yang kuat
   - Aktifkan HTTPS untuk production

2. **Password Default Admin**
   - Username: `admin` / Password: `admin123`
   - **WAJIB** diganti setelah instalasi pertama
   - Gunakan password yang kuat (minimal 12 karakter, kombinasi huruf, angka, simbol)

3. **Environment Variables**
   - Jangan commit file `.env` ke repository
   - File `.env` sudah ada di `.gitignore`
   - Setiap environment (dev/staging/production) harus punya `.env` sendiri

4. **Backup Database**
   - Lakukan backup database secara berkala
   - Simpan backup di lokasi yang aman
   - Test restore backup secara rutin

5. **Update Dependencies**
   - Jalankan `npm audit` secara berkala
   - Update dependencies yang memiliki security vulnerabilities
   - Test aplikasi setelah update dependencies

6. **Production Deployment**
   - Gunakan process manager seperti PM2
   - Setup reverse proxy (Nginx/Apache)
   - Aktifkan rate limiting untuk mencegah abuse
   - Monitor logs dan error secara real-time
   - Setup firewall dan security rules

7. **Data Privacy**
   - Aplikasi ini menyimpan data customer (nama, nomor telepon, email)
   - Pastikan comply dengan regulasi data privacy (GDPR, UU PDP Indonesia)
   - Informasikan customer tentang penggunaan data mereka

8. **Maintenance**
   - Lakukan maintenance rutin pada database
   - Clean up data lama jika diperlukan
   - Monitor disk space dan performance

**DISCLAIMER:**
Aplikasi ini disediakan "as is" tanpa warranty apapun. Developer tidak bertanggung jawab atas kerugian atau kerusakan yang timbul dari penggunaan aplikasi ini. Gunakan dengan risiko Anda sendiri.

---

**Developed by hello-hilmi**

© 2025 PangkasHub. All rights reserved.
