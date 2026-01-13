# Panduan Deployment: Vercel Frontend + Ngrok + Local Backend

Dokumen ini menjelaskan cara menghubungkan aplikasi Frontend yang di-deploy di **Vercel** dengan Backend yang berjalan di **Laptop/PC Lokal** menggunakan **Ngrok**.

## 1. Arsitektur
Karena Backend berjalan di laptop lokal (bukan di server cloud publik), Vercel (Cloud) tidak bisa menghubungi `localhost` Anda secara langsung. Kita menggunakan **Ngrok** sebagai "terowongan" (tunnel) publik yang aman.

`Browser User` -> `Vercel App (Frontend)` -> `Ngrok URL (Public)` -> `Laptop Anda (Localhost:8081)`

---

## 2. Persiapan (Sekali Saja)

Sudah dilakukan dalam setup ini:
1.  **Frontend**: Config environment untuk membedakan URL Local vs URL Ngrok.
    *   File: `src/environments/environment.prod.ts`
2.  **Frontend**: Bypass halaman warning Ngrok.
    *   File: `src/app/core/interceptors/auth.interceptor.ts` (Header `ngrok-skip-browser-warning`).
3.  **Backend**: Mengizinkan akses dari Vercel (CORS).
    *   File: `SecurityConfig.java` (Allowed Origins: `*`).

---

## 3. Langkah-Langkah Menjalankan Aplikasi

Setiap kali Anda ingin menggunakan aplikasi yang di-deploy di Vercel, ikuti langkah berikut:

### Langkah 1: Jalankan Backend Lokal
Pastikan backend Java Spring Boot Anda berjalan normal.
```bash
cd backend-plapofy
mvn spring-boot:run
```
*Backend akan berjalan di port `8081`.*

### Langkah 2: Jalankan Ngrok
Buka terminal baru dan jalankan Ngrok untuk mengekspos port 8081.
**PENTING**: Anda harus menggunakan domain static yang sudah Anda klaim (jika akun free, domainnya tetap, tapi session bisa expired).

Perintah:
```bash
ngrok http 8081 --domain=jani-overproficient-subaffluently.ngrok-free.dev
```

*Jika statusnya "Online", catat URL forwardingnya (seharusnya sama dengan yang di config).*

### Langkah 3: Akses Vercel
Buka URL aplikasi Anda di Vercel (contoh: `https://frontend-plapofy.vercel.app`).
Coba Login.
*   Jika Login berhasil, berarti Vercel sukses menghubungi Backend via Ngrok.

---

## 4. Cara Update Code (Deployment)

### Update Frontend
1.  Lakukan perubahan code di folder `frontend-plapofy`.
2.  Push ke GitHub:
    ```bash
    git add .
    git commit -m "Deskripsi perubahan"
    git push
    ```
3.  Vercel akan otomatis mendeteksi push tersebut dan melakukan **Re-build & Deploy**.
4.  Tunggu ~1-2 menit, lalu refresh website Vercel Anda.

### Update Backend
1.  Lakukan perubahan code di folder `backend-plapofy`.
2.  Restart server lokal (`Ctrl+C` lalu `mvn spring-boot:run` lagi).
    *   *Tidak perlu push ke GitHub agar perubahan backend efeknya terasa, karena yang diakses Vercel adalah backend LOKAL Anda.*
    *   Namun, tetap disarankan push ke GitHub untuk backup code:
        ```bash
        git add .
        git commit -m "Update backend"
        git push
        ```

---

## 5. Troubleshooting / Masalah Umum

### Data Dashboard Kosong / Error "No loan applications found"
*   **Penyebab**: Ngrok menampilkan halaman peringatan "Visit Site" yang menghalangi data JSON.
*   **Solusi**: Pastikan interceptor di frontend sudah mengirim header `ngrok-skip-browser-warning` (Sudah kita implementasikan). Jika masih error, coba akses URL ngrok langsung di browser dan klik "Visit Site" sekali.

### Error "Connection Refused"
*   **Penyebab**: Backend lokal mati atau Ngrok belum jalan.
*   **Solusi**: Cek terminal backend dan terminal Ngrok.

### Error CORS (Blocked by CORS policy)
*   **Penyebab**: Backend menolak request dari domain Vercel.
*   **Solusi**: Restart backend setelah mengubah code `SecurityConfig.java`. Pastikan `configuration.setAllowedOriginPatterns(java.util.List.of("*"));` ada.

### URL Ngrok Berubah
*   **Penyebab**: Anda merestart Ngrok tanpa `--domain`.
*   **Solusi**: 
    1.  Hostikan domain ngrok tetap sama (`jani-overproficient-subaffluently...`).
    2.  Jika domain BERUBAH, Anda harus mengupdate file `frontend-plapofy/src/environments/environment.prod.ts` dengan URL baru, lalu Push ke GitHub agar Vercel juga update.
