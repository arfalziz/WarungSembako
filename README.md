# Warung Sembako Backend API

Backend service untuk aplikasi Warung Sembako, dibangun menggunakan **Node.js, Fastify, TypeScript, dan Drizzle ORM (MySQL)**. API ini menyediakan layanan untuk autentikasi pengguna, manajemen produk, dan proses transaksi/checkout.

## 🚀 Fitur Utama
- **Autentikasi (JWT)**: Registrasi, Login, serta manajemen Role (Admin & Customer).
- **Manajemen Produk**: Sistem CRUD (Create, Read, Update, Delete) produk khusus untuk Admin, sedangkan Publik/Customer dapat mencari dan melihat detail produk.
- **Manajemen Pesanan (Checkout)**: Fitur pemesanan dengan validasi dan pemotongan stok otomatis, beserta manajemen status pesanan oleh Admin.

## 🛠️ Tech Stack
- **Framework**: Fastify
- **Bahasa**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: MySQL
- **Autentikasi**: `@fastify/jwt` & `bcryptjs`

## ⚙️ Persyaratan Sistem
- Node.js (v18 atau lebih baru disarankan)
- Database MySQL Server berjalan di lokal atau remote

## 📦 Instalasi & Cara Menjalankan

1. **Install Dependensi:**
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables:**
   Buat file `.env` di direktori utama (root) dengan contoh konfigurasi sebagai berikut:
   

3. **Inisialisasi & Sinkronisasi Database:**
   Generate dan dorong skema database Drizzle ke MySQL:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://127.0.0.1:3000` (atau port sesuai konfigurasi `.env`).

---

## 📚 Daftar Endpoint API

### 1. Autentikasi (`/api/v1/auth`)
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| `POST` | `/register` | Mendaftarkan pengguna baru (Role: Customer) | Publik |
| `POST` | `/login` | Login dan mendapatkan Token JWT | Publik |
| `GET`  | `/me` | Mendapatkan data profil user yang sedang login | Authenticated |

### 2. Produk (`/api/v1/products`)
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| `GET`  | `/` | Mengambil daftar produk (Mendukung query `?search=` & `?category=`) | Publik |
| `GET`  | `/:id` | Mengambil detail spesifik produk berdasarkan ID | Publik |
| `POST` | `/` | Menambahkan produk baru | Admin |
| `PUT`  | `/:id` | Mengupdate data produk yang sudah ada | Admin |
| `DELETE`| `/:id`| Menghapus data produk | Admin |

### 3. Pesanan (`/api/v1/orders`)
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| `POST` | `/` | Melakukan checkout pesanan (otomatis mengurangi stok produk) | Customer |
| `GET`  | `/` | Melihat riwayat pesanan (Khusus milik user bersangkutan) | Customer |
| `GET`  | `/all`| Melihat seluruh data pesanan dari semua user | Admin |
| `PUT`  | `/:id/status`| Mengubah status pesanan (`pending`, `diproses`, `selesai`) | Admin |

---
## 🐞 Perintah Lainnya (Scripts)
- `npm run dev`: Menjalankan server dalam mode watch (menggunakan tsx).
- `npm run db:generate`: Membuat file migrasi Drizzle berdasarkan perubahan `schema.ts`.
- `npm run db:push`: Mendorong perubahan skema secara langsung ke database.
