# Setup MongoDB untuk Sistem Absensi

## Cara Install MongoDB di Windows

### Opsi 1: MongoDB Community Server (Recommended)

1. **Download MongoDB Community Server**
   - Kunjungi: https://www.mongodb.com/try/download/community
   - Pilih versi terbaru untuk Windows
   - Download file .msi

2. **Install MongoDB**
   - Jalankan file .msi yang sudah didownload
   - Pilih "Complete" installation
   - Centang "Install MongoDB as a Service"
   - Centang "Run service as Network Service user"
   - Install MongoDB Compass (GUI tool) - opsional tapi direkomendasikan

3. **Verifikasi Installation**
   - Buka Command Prompt sebagai Administrator
   - Jalankan: `mongod --version`
   - Jika berhasil, akan muncul versi MongoDB

4. **Start MongoDB Service**
   - Buka Services (Win + R, ketik `services.msc`)
   - Cari "MongoDB" service
   - Klik kanan → Start (jika belum running)

### Opsi 2: MongoDB dengan Docker (Alternative)

Jika sudah ada Docker:

```bash
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo

# Verify container is running
docker ps
```

### Opsi 3: MongoDB Atlas (Cloud - Free Tier)

1. Daftar di https://www.mongodb.com/atlas
2. Buat cluster gratis
3. Dapatkan connection string
4. Update file `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system
   ```

## Cara Menjalankan Aplikasi

### 1. Setup Environment
```bash
# Copy environment file
cp server/.env.example server/.env

# Edit server/.env sesuai kebutuhan
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Start MongoDB
- Pastikan MongoDB service sudah running
- Atau jalankan Docker container jika menggunakan Docker

### 4. Start Backend Server
```bash
# Terminal 1 - Backend
npm run server:dev
```

### 5. Start Frontend
```bash
# Terminal 2 - Frontend  
npm run dev
```

## Troubleshooting

### MongoDB Connection Error
Jika muncul error `connect ECONNREFUSED ::1:27017`:

1. **Cek MongoDB Service**
   ```bash
   # Windows
   net start MongoDB
   
   # Atau via Services.msc
   ```

2. **Cek Port 27017**
   ```bash
   netstat -an | findstr 27017
   ```

3. **Test Connection**
   ```bash
   # Jika MongoDB Compass terinstall
   # Buka MongoDB Compass
   # Connect ke: mongodb://localhost:27017
   ```

### PostCSS Error
Jika masih ada error PostCSS, coba:

```bash
# Clear node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

## Default Login Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### User/Pegawai
- Login menggunakan QR Code yang digenerate oleh admin

## Database Schema

Database akan otomatis dibuat dengan collections:
- `employees` - Data pegawai
- `attendances` - Record absensi  
- `leaverequests` - Pengajuan izin
- `notifications` - Notifikasi user
- `worksettings` - Pengaturan jam kerja

## Port yang Digunakan

- Frontend: http://localhost:5173 atau 5174
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## Tips

1. **Backup Database**
   ```bash
   mongodump --db attendance_system --out backup/
   ```

2. **Restore Database**
   ```bash
   mongorestore --db attendance_system backup/attendance_system/
   ```

3. **View Database via MongoDB Compass**
   - Connection String: `mongodb://localhost:27017`
   - Database: `attendance_system`

4. **Reset Database** (jika diperlukan)
   ```bash
   # Via MongoDB shell
   mongo
   use attendance_system
   db.dropDatabase()
   ```