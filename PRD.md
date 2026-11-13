# Product Requirement Document (PRD)
## Kalarsa - Portal Kebutuhan & Informasi Kuliah

- **Status**: Updated (v2.0)
- **Tema Desain**: Colorful, Enerjik, & Modern (Pastel & Vibrant accents)
- **Target Platform**: Web (Responsive: Mobile & Desktop)
- **Target Pengguna**: Mahasiswa dan Pengurus Kelas / Admin (Komti/Sekretaris Kelas)

---

## 1. Latar Belakang & Tujuan
**Kalarsa** adalah aplikasi web serbaguna yang dirancang untuk mempermudah dinamika perkuliahan harian mahasiswa dan pengurus kelas. Web ini menghadirkan suasana yang segar dan berwarna (*colorful*) dengan fitur terpadu: jadwal kuliah, pusat informasi/pengumuman kelas multi-media, daftar tugas ber-deadline, dan alat pengacak kelompok.

Aplikasi ini bertujuan untuk:
1. Menyediakan papan informasi pengumuman kelas (teks, gambar, video) yang dikelola admin dan dapat diakses semua mahasiswa.
2. Menyediakan jadwal kuliah harian/mingguan lengkap dengan beban SKS, ruangan, dan gedung perkuliahan.
3. Memfasilitasi pembagian kelompok secara acak, transparan, dan seru melalui mekanisme spin kelompok.
4. Menyediakan pelacak daftar tugas aktif lengkap dengan batas waktu (*deadline*).

---

## 2. Peran Pengguna (User Roles)

| Peran | Deskripsi | Hak Akses |
|---|---|---|
| **Admin (Pengurus Kelas / Komti)** | Mahasiswa yang bertanggung jawab mengelola informasi kelas | - Mengelola Papan Informasi (Buat, Edit, Hapus pengumuman teks/gambar/video)<br>- Mengelola Jadwal Kuliah & Gedung (Tambah, Edit, Hapus)<br>- Mengelola Daftar Tugas (Tambah, Edit, Hapus)<br>- Mengakses dan mengontrol Spin Kelompok |
| **Mahasiswa (Anggota Kelas)** | Seluruh mahasiswa anggota kelas | - Melihat Papan Informasi & menonton video/melihat gambar pengumuman<br>- Melihat Jadwal Kuliah & Gedung perkuliahan<br>- Melihat Daftar Tugas & Countdown Deadline<br>- Menjalankan Spin Kelompok |

---

## 3. Ruang Lingkup Fitur (Feature Specifications)

### 3.1. Fitur 1: Papan Informasi & Pengumuman Kelas (Multi-Media)
Pusat pengumuman resmi kelas agar tidak ada informasi penting dari dosen atau pengurus yang tenggelam di chat WhatsApp.

- **Format Informasi**:
  - **Teks**: Pengumuman artikel, instruksi singkat, atau catatan penting.
  - **Gambar**: Poster lomba, infografis jadwal UTS/UAS, atau surat edaran fakultas.
  - **Video**: Video materi pembelajaran, rekaman zoom, atau tutorial praktikum (mendukung embed YouTube atau video langsung).
- **Data Fields**:
  - `Judul Pengumuman` *(String, Wajib)*.
  - `Isi Konten / Deskripsi` *(Text, Wajib)*.
  - `Tipe Media` *(Enum: 'text', 'image', 'video')*.
  - `URL Media` *(String, URL Gambar atau URL Video YouTube / Direct Link)*.
  - `Disematkan / Pinned` *(Boolean, Pengumuman penting tetap di atas)*.
  - `Tanggal Dibuat` *(Timestamp)*.
- **Hak Akses**:
  - **Hanya Admin** yang dapat membuat, mengubah, atau menghapus informasi.
  - **Seluruh Pengguna** dapat membaca, melihat gambar, dan memutar video langsung di web.

---

### 3.2. Fitur 2: Jadwal Mata Kuliah & Gedung
- **Data Fields**:
  - `Nama Mata Kuliah` *(String, Wajib)*.
  - `Hari Kuliah` *(Enum, Wajib)*: Senin - Sabtu.
  - `Jam Kuliah` *(Time Range, Wajib)*: Mulai & Selesai.
  - `SKS Mata Kuliah` *(Integer, Wajib)*.
  - `Nama Gedung` *(String, Wajib)*: Contoh: *Gedung A (Rektorat)*, *Gedung C (Fakultas Teknik)*, *Gedung Baru Lantai 3*.
  - `Ruangan / Tautan Kelas` *(String, Opsional)*: Ruang kelas atau link Zoom.
  - `Dosen Pengampu` *(String, Opsional)*.

---

### 3.3. Fitur 3: Spin Pembagian Kelompok
- Pengacakan interaktif dengan roda putar (*Wheel Spinner*) bertema warna-warni (*colorful*).
- Opsi pembagian berdasarkan jumlah kelompok atau kuota orang per kelompok.
- Tombol salin format pesan WhatsApp kelas.

---

### 3.4. Fitur 4: Daftar Tugas & Deadline Tracker
- Pelacak tugas dengan filter mata kuliah dan status (Belum Dimulai, Berjalan, Selesai).
- Kartu tugas dengan indikator waktu & urgensi warna-warni.

---

## 4. Arsitektur & Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Frontend Framework** | **React (Vite)** | Cepat, modular, dan performa tinggi untuk SPA |
| **Styling** | **Tailwind CSS** | Desain responsif (*mobile-first*), modern, dan mudah dikustomisasi |
| **Icon Library** | **Lucide React** | Ikon clean dan konsisten |
| **Backend & Database** | **Supabase** | Backend-as-a-Service (PostgreSQL, Realtime, REST API) |
| **Client Library** | `@supabase/supabase-js` | Integrasi langsung dari React ke Supabase |

---

## 5. Rancangan Skema Basis Data (Supabase Schema Draft)

### 5.1. Tabel `courses` (Jadwal Mata Kuliah & Lokasi Gedung)
```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  day text not null, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  start_time text not null, -- misal: '08:00'
  end_time text not null,   -- misal: '09:40'
  credits integer not null, -- SKS, misal: 2, 3, 4
  building text,            -- Nama Gedung (misal: Gedung B, Gedung TI)
  room text,                -- contoh: 'Lab Komputer 2' atau link meeting
  lecturer text,            -- contoh: 'Dr. John Doe, M.Kom.'
  created_at timestamp with time zone default now()
);
```

### 5.2. Tabel `announcements` (Informasi & Pengumuman Kelas)
```sql
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  media_type text default 'text', -- 'text' | 'image' | 'video'
  media_url text,                 -- URL gambar atau link/embed video
  pinned boolean default false,   -- Pin pengumuman prioritas
  created_at timestamp with time zone default now()
);
```

### 5.3. Tabel `assignments` (Daftar Tugas)
```sql
create table assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete set null,
  course_name text, -- cache nama matkul jika relasi null
  title text not null,
  description text,
  assigned_date date not null default current_date,
  deadline timestamp with time zone not null,
  type text default 'individual', -- 'individual' | 'group'
  status text default 'pending',  -- 'pending' | 'in_progress' | 'completed'
  created_at timestamp with time zone default now()
);
```

### 5.3. Tabel `group_draws` (Riwayat Spin Kelompok - Opsional)
```sql
create table group_draws (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  total_groups integer not null,
  raw_members jsonb not null,
  result_groups jsonb not null,
  created_at timestamp with time zone default now()
);
```

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Responsif (Mobile-First)**: Mahasiswa sering mengakses jadwal dan tugas lewat smartphone, sehingga tampilan mobile harus nyaman dan intuitif.
2. **User Experience (UX)**: Navigasi sederhana dan bersih (Clean & Modern UI).
3. **Penyimpanan Data (Persistence)**:
   - Terkoneksi ke database cloud Supabase melalui variable environment (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
   - Dilengkapi fallback offline/dummy data jika API Supabase belum dikonfigurasi.
4. **Sistem Proteksi Admin**:
   - Mode Admin dengan proteksi PIN / Passcode sederhana di antarmuka (atau Supabase Auth) agar data tidak sembarangan diubah.

---

## 7. Rencana Fase Pengembangan (Milestones)

- **Fase 1: Setup Proyek & Konfigurasi**
  - Inisialisasi React Vite + Tailwind CSS.
  - Setup struktur folder dan client Supabase (`supabaseClient.js`).
- **Fase 2: Layout & Navigasi Utama**
  - Header/Navbar, tab navigasi (Jadwal, Tugas, Spin Kelompok), toggle mode Admin (PIN).
- **Fase 3: Modul Jadwal Mata Kuliah**
  - Form input/edit jadwal (Admin), list jadwal harian/mingguan, badge SKS.
- **Fase 4: Modul Daftar Tugas & Deadline**
  - Form input tugas baru, card tugas dengan countdown timer & indikator warna.
- **Fase 5: Modul Spin Kelompok**
  - Input list mahasiswa, roda putar / pengacakan interaktif, output pembagian kelompok + copy hasil.
- **Fase 6: Integrasi Supabase & Polishing**
  - Menyambungkan kredensial API Supabase, testing query CRUD, dan optimasi responsivitas.
