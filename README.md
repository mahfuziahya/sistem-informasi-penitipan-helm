# SIMPAN - Sistem Informasi Penitipan Helm

SIMPAN adalah sistem informasi penitipan helm berbasis QR Code untuk membantu proses penitipan dan pengambilan helm secara digital.

## Fitur

- Login Admin dan Petugas
- Check-In penitipan helm
- Generate QR Code
- Check-Out menggunakan QR Code
- Pencarian berdasarkan nomor plat
- Dashboard
- Manajemen rak
- Laporan harian
- Export laporan PDF

## Teknologi

**Frontend**
- React
- TypeScript
- Tailwind CSS
- Axios
- React Router

**Backend**
- Node.js
- Express.js
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Zod

## Struktur Project

Sistem Informasi Penitipan Helm/
├── Backend/
├── Frontend/
├── README.md
└── .gitignore

## Cara Menjalankan

### Backend

Masuk ke folder Backend:

    cd Backend
    npm install

Buat file `.env` dan sesuaikan konfigurasi PostgreSQL:

    DATABASE_URL="postgresql://username:password@localhost:5432/nama_database"
    JWT_SECRET="secret_key"
    PORT=3000

Kemudian jalankan:

    npx prisma generate
    npx prisma migrate dev
    npm run dev

### Frontend

Buka terminal baru:

    cd Frontend
    npm install
    npm run dev

Kemudian buka alamat localhost yang diberikan oleh Vite.

## Akun Demo

Admin:

    Username: admin
    Password: admin123

Petugas:

    Username: officer
    Password: officer123

## Alur Sistem

1. Admin atau Petugas melakukan login.
2. Petugas melakukan Check-In helm.
3. Sistem menyimpan data penitipan.
4. Sistem membuat tiket dan QR Code.
5. QR Code digunakan saat pengambilan helm.
6. Petugas melakukan scan QR Code.
7. Sistem melakukan Check-Out.
8. Admin dapat melihat dashboard dan laporan.

## Role

### Admin
- Dashboard
- Check-In
- Check-Out
- Manajemen Rak
- Laporan

### Petugas
- Check-In
- Check-Out

## Database

Sistem menggunakan PostgreSQL dengan Prisma ORM.

Tabel utama:

- User
- Rack
- Transaction
- DailyReport

## Keamanan

- JWT Authentication
- Password menggunakan hashing
- Validasi request menggunakan Zod
- Role-based authorization
- File `.env` tidak disimpan di GitHub

## Lisensi

SIMPAN - Sistem Informasi Penitipan Helm Berbasis QR Code