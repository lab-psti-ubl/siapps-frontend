# Sistem Absensi dengan MongoDB

Sistem absensi modern yang terintegrasi dengan database MongoDB, dilengkapi dengan fitur QR Code scanning, GPS tracking, dan manajemen izin.

## 🚀 Fitur Utama

### Admin Dashboard
- **Manajemen Pegawai**: CRUD pegawai dengan QR Code otomatis
- **Data Alat RFID**: Kelola alat pembaca RFID dengan MAC address
- **Monitoring Absensi**: Real-time tracking absensi pegawai
- **Kelola Izin**: Approve/reject pengajuan izin
- **Laporan**: Export PDF laporan absensi dan pegawai
- **Pengaturan**: Konfigurasi jam kerja dan toleransi

### User Dashboard
- **Absensi Foto**: Check-in/out dengan selfie dan GPS validation
- **QR Code**: Personal QR untuk scan oleh admin
- **RFID Card**: Absensi menggunakan tap kartu RFID
- **Pengajuan Izin**: Submit leave request dengan approval workflow
- **Riwayat**: Lihat history absensi personal
- **Notifikasi**: Real-time updates untuk status izin

## 🛠️ Teknologi

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Vite
- HTML5 QR Code Scanner
- React Webcam
- Lucide Icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- RabbitMQ (untuk integrasi RFID)
- CORS
- Multer (file upload)
- dotenv

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd attendance-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MongoDB
Pastikan MongoDB berjalan di `mongodb://localhost:27017`

### 4. Environment Variables
Buat file `.env` di root folder:
```env
MONGODB_URI=mongodb://localhost:27017/attendance_system
PORT=5000
COMPANY_LATITUDE=-5.4011664
COMPANY_LONGITUDE=105.3541365
COMPANY_RADIUS_METERS=20000
RABBITMQ_URL=amqp://localhost
MQTT_RESPONSE_TOPIC=absenRFID_respons
```

### 5. Test MQTT Connection
```bash
# Install MQTT client
npm install -g mqtt

# Test publish
mqtt pub -h 195.35.23.135 -p 1883 -u arimardi -P arimardi -t absenRFID -m '{"mac":"C4:D8:D5:13:A3:AF","guid":"5a2a0ac"}'

# Test subscribe
mqtt sub -h 195.35.23.135 -p 1883 -u arimardi -P arimardi -t absenRFID

# Test subscribe to response topic
mqtt sub -h 195.35.23.135 -p 1883 -u arimardi -P arimardi -t absenRFID_respons
```

### 5. Jalankan Aplikasi

#### Development Mode
```bash
# Terminal 1 - Backend Server
npm run server:dev

# Terminal 2 - Frontend
npm run dev
```

#### Production Mode
```bash
# Backend
npm run server

# Frontend
npm run build
npm run preview
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/user/login` - User login dengan QR

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/:id/attendance` - Get employee attendance

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `POST /api/attendance/qr-scan` - QR scan attendance
- `GET /api/attendance/stats/daily` - Daily statistics

### RFID Attendance
- `POST /api/rfid-attendance/tap` - Process RFID tap
- `GET /api/rfid-attendance/logs` - Get RFID attendance logs

### Leave Requests
- `GET /api/leave-requests` - Get leave requests
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id/status` - Update status

### Notifications
- `GET /api/notifications/employee/:id` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Settings
- `GET /api/settings/work` - Get work settings
- `PUT /api/settings/work` - Update work settings

## 📱 Cara Penggunaan

### Metode Absensi
1. **QR Code**: Admin scan QR pegawai menggunakan scanner
2. **Foto + GPS**: Pegawai selfie dengan validasi lokasi melalui dashboard user
3. **RFID Card**: Pegawai tap kartu RFID pada alat yang terdaftar (otomatis via MQTT)

### MQTT Integration
- **Input Topic**: `absenRFID` - Menerima data tap RFID dari alat
- **Response Topic**: `absenRFID_respons` - Mengirim callback respons ke RMQ
- **Format Input**: `{"mac":"C4:D8:D5:13:A3:AF","guid":"5a2a0ac"}`
- **Format Response**: 
  ```json
  {
    "mac": "C4:D8:D5:13:A3:AF",
    "guid": "5a2a0ac",
    "status": "guid_registered|guid_not_registered|checkin_success|checkout_success|already_completed|error",
    "message": "Nama Pegawai berhasil absen|GUID tidak terdaftar",
    "employeeName": "Nama Pegawai",
    "deviceName": "RFID Reader Pintu Masuk",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  ```

### Admin
1. Login dengan username: `admin`, password: `admin123`
2. Tambah pegawai di menu "Data Pegawai"
3. Daftarkan alat RFID di menu "Data Alat RFID"
4. Assign kartu RFID ke pegawai
3. Download QR Code pegawai
4. Monitor absensi real-time
5. Kelola pengajuan izin

### Pegawai
1. Login dengan scan QR Code personal
2. Lakukan absensi masuk dengan foto + GPS atau tap kartu RFID
3. Ajukan izin jika diperlukan
4. Absensi keluar dengan foto + GPS atau tap kartu RFID
5. Lihat riwayat absensi

## 🔒 Keamanan

- **GPS Validation**: Radius 20km dari lokasi perusahaan
- **Photo Verification**: Mandatory selfie untuk absensi
- **QR Code Encryption**: Unique encrypted QR per pegawai
- **RFID Authentication**: Validasi MAC address alat dan GUID kartu
- **Data Validation**: Server-side validation untuk semua input

## 📊 Database Schema

### Collections
- `employees` - Data pegawai
- `rfiddevices` - Data alat RFID
- `attendances` - Record absensi
- `leaverequests` - Pengajuan izin
- `notifications` - Notifikasi user
- `worksettings` - Pengaturan jam kerja

## 🚀 Deployment

### MongoDB Setup
1. Install MongoDB Community Server
2. Start MongoDB service
3. Database akan otomatis dibuat saat pertama kali run

### MQTT Broker Setup
1. Pastikan MQTT broker berjalan di 195.35.23.135:1883
2. Credentials: username=arimardi, password=arimardi
3. Topic: absenRFID
4. Format data: {"mac":"C4:D8:D5:13:A3:AF","guid":"5a2a0ac"}

### Production Deployment
1. Build frontend: `npm run build`
2. Setup reverse proxy (nginx)
3. Configure environment variables
4. Setup MQTT broker connection
4. Start backend server: `npm run server`

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

Untuk bantuan dan pertanyaan, silakan buat issue di repository ini.