# 🚀 Pitch Deck Frontend: Plapofy
**Modern Loan Management System Interface**

---

## 1. Latar Belakang Aplikasi
Dalam era digital banking, pengalaman pengguna (UX) adalah kunci. Sistem pinjaman lama seringkali:
*   **Membingungkan:** Form yang panjang tanpa panduan.
*   **Lambat:** Harus memuat ulang halaman (reload) setiap kali berpindah menu.
*   **Tidak Responsif:** Sulit diakses melalui HP/Mobile.
*   **Blackbox:** User tidak tahu status pengajuan mereka secara real-time.

**Plapofy Frontend** hadir sebagai solusi **Single Page Application (SPA)** yang menawarkan pengalaman seperti aplikasi native: Cepat, Responsif, dan Interaktif.

---

## 2. Nama Aplikasi
**Plapofy** (Platform Loan Application & Portfolio Yield).

---

## 3. Fitur Aplikasi (Frontend Highlights)

### 👥 Untuk Nasabah
*   **Dashboard Personal:** Ringkasan limit dan status pinjaman dalam satu pandangan.
*   **Active Loan Widget:** Kartu visual yang menampilkan sisa tenor, tanggal jatuh tempo, dan besar angsuran secara real-time.
*   **Reactive Profile:** Form pengisian data diri dan bank dengan validasi instan.
*   **KYC Upload:** Antarmuka upload KTP/Selfie yang mudah.

### 🛡️ Untuk Staff (Marketing/BM/Admin)
*   **Role-Based Menu:** Sidebar otomatis menyesuaikan dengan hak akses (Admin tidak melihat menu Nasabah, dst).
*   **Approval Workflow:** Antarmuka review dokumen dengan preview gambar KTP langsung di browser.

---

## 4. Show Project (Demo Flows)

### ✅ Happy Flow (Skenario Ideal)
1.  **Login:** User masuk, token JWT disimpan di memory/storage.
2.  **Redirect:** Sistem mendeteksi role (misal: Nasabah) dan mengarahkan ke Dashboard Nasabah.
3.  **Submit:** Nasabah mengisi form, upload KTP, klik Submit.
4.  **Feedback:** Muncul notifikasi sukses "Loan Submitted".
5.  **Update:** Status di dashboard berubah menjadi "SUBMITTED" secara instan tanpa refresh.

### ⚠️ Edge Flow (Skenario Pinggiran)
*   **Refresh Halaman:** Saat user me-refresh browser, state user tetap bertahan (Rehydration dari Storage) sehingga tidak perlu login ulang.
*   **Koneksi Lambat:** Menampilkan *Loading Skeleton* atau spinner saat data sedang diambil dari API.

### ❌ Negative Flow (Skenario Gagal)
*   **Akses Ilegal:** Nasabah mencoba mengetik URL `/admin` -> Dicegat oleh `RoleGuard` -> Redirect ke `403 Forbidden` atau Dashboard.
*   **Input Salah:** Nasabah memasukkan huruf di kolom "No Rekening" -> Tombol "Save" disable otomatis + Pesan error merah muncul di bawah input.

---

## 5. Tech Stack & Tools

*   **Core Framework:** **Angular 19** (Versi terbaru dengan performa tinggi).
*   **State Management:**
    *   **NgRx (Store):** Untuk data global yang kompleks (List Pinjaman, Data Master).
    *   **Angular Signals:** Untuk data lokal yang butuh update UI super cepat (Profil User).
*   **Styling:** **Tailwind CSS**. Membuat desain responsif (Mobile-First) dengan cepat tanpa menulis CSS manual.
*   **Icons:** **Lucide Angular**. Ikon vektor ringan dan tajam.
*   **HTTP Client:** **RxJS**. Menangani komunikasi API asinkron.

---

## 6. Design Pattern

*   **Smart & Dumb Components:**
    *   *Smart (Container):* Mengelola data/logic (contoh: `LoanListComponent`).
    *   *Dumb (Presentational):* Hanya menampilkan data (contoh: `LoanCardComponent`).
*   **Observer Pattern:** Digunakan pada `HttpClient` untuk memantau respons API.
*   **Facade Service:** `LoanService` membungkus kompleksitas panggilan API sehingga komponen hanya tinggal panggil satu fungsi sederhana.
*   **Interceptors:** `AuthInterceptor` menyisipkan Token JWT ke *setiap* request secara otomatis (Pusat logika keamanan).

---

## 7. Metode Pengembangan
*   **Component-Driven Development (CDD):** Membangun UI dari komponen kecil (Button, Input, Card) lalu dirakit menjadi Halaman utuh.
*   **Mobile-First Design:** Desain dibuat agar terlihat bagus di layar HP terlebih dahulu, baru disesuaikan untuk Laptop/Desktop.

---

## 8. Struktur Folder (`src/app`)

*   📂 **core/** (Inti aplikasi, dipanggil sekali)
    *   📂 `services/` (API calls: AuthService, LoanService)
    *   📂 `store/` (NgRx State: Reducers, Actions, Effects)
    *   📂 `interceptors/` (Security logic)
    *   📂 `guards/` (Pelindung rute)
*   📂 **features/** (Halaman fungsional)
    *   📂 `auth/` (Login)
    *   📂 `dashboard/` (Halaman utama)
    *   📂 `profile/` (Edit data diri)
    *   📂 `loans/` (Form pengajuan & List)
*   📂 **shared/** (Komponen ulang-pakai)
    *   📂 `components/` (Layout, Navbar, Sidebar)

---

## 9. Q&A Session (30 Pertanyaan Prediksi)

### Technical & Architecture
1.  **Q:** Mengapa memilih Angular dibanding React/Vue?
    *   **A:** Angular adalah framework *batteries-included* (lengkap dengan Router, Form Validation, HTTP Client) yang sangat cocok untuk aplikasi Enterprise yang butuh standar struktur kode yang ketat.

2.  **Q:** Apa fungsi `NgRx` di sini? Bukankah Angular Service sudah cukup?
    *   **A:** Untuk aplikasi skala kecil Service cukup. Tapi untuk Plapofy, NgRx membantu mengelola state yang kompleks (seperti filter list pinjaman) agar konsisten di semua halaman dan mudah di-debug.

3.  **Q:** Bagaimana cara menangani keamanan token di Frontend?
    *   **A:** Token disimpan (saat ini di LocalStorage untuk kemudahan), namun idealnya di HttpOnly Cookie. Token otomatis disisipkan oleh Interceptor, dan Guard mencegah akses tanpa token.

4.  **Q:** Apa itu `Signals` dan kenapa dipakai?
    *   **A:** Fitur baru Angular 19 untuk reaktivitas granular. Jika data `Saldo` berubah, Angular hanya update teks saldo itu saja di layar, tidak me-render ulang seluruh halaman. Performa jauh lebih baik.

5.  **Q:** Bagaimana validasi form bekerja?
    *   **A:** Menggunakan `ReactiveFormsModule`. Validasi dilakukan real-time saat user mengetik (misal: format email, panjang NIK). Tombol submit mati jika form tidak valid.

6.  **Q:** Apa bedanya Smart dan Dumb Component di proyek ini?
    *   **A:** `ProfileComponent` adalah Smart Component (dia bicara ke Store/API). Sedangkan `LayoutComponent` adalah Dumb Component (hanya menampilkan konten yang diberikan).

7.  **Q:** Bagaimana integrasi dengan Backend?
    *   **A:** Menggunakan REST API standard via `HttpClient`. Backend dan Frontend terpisah (Decoupled), komunikasi via JSON.

8.  **Q:** Mengapa menggunakan Tailwind CSS?
    *   **A:** Mempercepat pengembangan UI dengan *utility classes*, memastikan konsistensi desain, dan memudahkan pembuatan layout responsif (Mobile-First) tanpa menulis file CSS terpisah.

9.  **Q:** Bagaimana strategi handling error di Frontend?
    *   **A:** Menggunakan `HttpInterceptor` global untuk menangkap error API (401, 403, 500) dan menampilkan notifikasi toast atau redirect ke halaman login secara otomatis.

10. **Q:** Apa fungsi `AuthGuard` dan `RoleGuard`?
    *   **A:** `AuthGuard` mencegah akses ke halaman private tanpa login. `RoleGuard` membatasi akses halaman spesifik berdasarkan role user (misal: Nasabah tidak bisa masuk halaman Admin).

### User Experience (UX) & Flow
11. **Q:** Bagaimana jika internet user mati saat submit?
    *   **A:** Saat ini akan muncul error koneksi. Ke depannya bisa diterapkan PWA (Progressive Web App) dengan *Service Worker* untuk menyimpan data sementara (Offline Mode).

12. **Q:** Apakah desainnya responsif?
    *   **A:** Ya, berkat Tailwind CSS, tampilan otomatis menyesuaikan layout Grid/Flexbox berdasarkan ukuran layar (Mobile/Tablet/Desktop).

13. **Q:** Bagaimana user tahu status pinjamannya berubah?
    *   **A:** Dashboard melakukan *polling* data atau menerima notifikasi real-time (bisa dikembangkan dengan WebSocket) untuk memperbarui status pinjaman di UI tanpa refresh manual.

14. **Q:** Apakah nasabah bisa mengedit data diri setelah submit?
    *   **A:** Tidak bisa untuk data kritis (KTP/Nama) saat status pinjaman sedang diproses (Locked), untuk menjaga integritas data verifikasi.

15. **Q:** Bagaimana flow jika user lupa password?
    *   **A:** User mengklik "Lupa Password", sistem mengirim link reset ke email (simulasi), user membuat password baru di halaman khusus, lalu login ulang.

### Performance & Optimization
16. **Q:** Bagaimana cara optimasi loading awal aplikasi?
    *   **A:** Menggunakan *Lazy Loading* pada Router. Modul Admin tidak akan didownload jika user adalah Nasabah, menghemat bandwidth dan waktu load.

17. **Q:** Bagaimana menangani upload gambar KTP yang besar?
    *   **A:** Di sisi Frontend, kita bisa menambahkan kompresi gambar (canvas resizing) sebelum dikirim ke server untuk menghemat kuota user dan storage server.

18. **Q:** Apakah aplikasi ini mendukung *Dark Mode*?
    *   **A:** Tailwind CSS mendukung *Dark Mode* bawaan. Fitur ini bisa diaktifkan dengan mudah dengan menambahkan toggle class `dark` pada root elemen.

19. **Q:** Bagaimana state aplikasi bertahan saat refresh?
    *   **A:** Menggunakan `LocalStorage` atau `SessionStorage` untuk menyimpan token dan data user sementara (Hydration).

20. **Q:** Apa itu *Standalone Components* di Angular 19?
    *   **A:** Komponen yang tidak butuh `NgModule`. Ini mengurangi boilerplate code, membuat aplikasi lebih ringan, dan memudahkan *Lazy Loading*.

### Security & Compliance
21. **Q:** Bagaimana mencegah serangan XSS (Cross-Site Scripting)?
    *   **A:** Angular secara default melakukan sanitasi (pembersihan) terhadap semua input yang ditampilkan di template HTML, mencegah injeksi script berbahaya.

22. **Q:** Bagaimana mencegah CSRF (Cross-Site Request Forgery)?
    *   **A:** Backend Spring Security menangani CSRF token, dan Frontend Angular `HttpClient` otomatis mendukung pengiriman token XSRF jika dikonfigurasi.

23. **Q:** Apakah data sensitif user terlihat di URL?
    *   **A:** Tidak. Semua data sensitif dikirim melalui Body Request (POST/PUT) yang terenkripsi HTTPS, bukan via URL parameter.

24. **Q:** Bagaimana jika token JWT kadaluarsa?
    *   **A:** Interceptor akan mendeteksi error 401, lalu mencoba melakukan *Refresh Token* (jika ada) atau memaksa logout user ke halaman login.

25. **Q:** Apakah admin bisa melihat password user?
    *   **A:** Tidak. Password di-hash di backend. Frontend hanya mengirim password saat login/register dan tidak pernah menyimpannya.

### Scalability & Future Plan
26. **Q:** Apakah Frontend ini bisa dijadikan aplikasi Mobile (Android/iOS)?
    *   **A:** Bisa, menggunakan **Capacitor** atau **Ionic**. Karena berbasis Angular, kode yang sama bisa dibungkus menjadi aplikasi native hybrid.

27. **Q:** Bagaimana jika fitur bertambah banyak? Apakah kode akan berantakan?
    *   **A:** Tidak, karena struktur *Feature-Based* memisahkan kode per fitur (Folder Loan, Profile, Auth terpisah). Ini memudahkan *scaling* tim developer.

28. **Q:** Bagaimana proses testing di Frontend?
    *   **A:** Unit Testing menggunakan **Jasmine/Karma** untuk logika komponen/service, dan E2E Testing menggunakan **Cypress/Playwright** untuk simulasi flow user.

29. **Q:** Apakah aplikasi mendukung multi-bahasa (i18n)?
    *   **A:** Angular memiliki library `i18n` bawaan. Kita bisa menyiapkan file terjemahan (JSON) untuk mendukung Bahasa Indonesia dan Inggris.

30. **Q:** Apa tantangan terbesar mengembangkan Frontend ini?
    *   **A:** Mengelola state role user (Nasabah vs Admin) agar tampilan sidebar dan akses menu benar-benar aman dan dinamis tanpa *flicker*, serta sinkronisasi data real-time antar komponen.
