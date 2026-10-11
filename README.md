# Grand Ontama V1

Versi awal website Grand Ontama dengan halaman tipe rumah, galeri, fasilitas, dan artikel properti.

**Status:** Pengembangan lokal; demo publik belum tersedia.

## Fitur

- Halaman tipe rumah Luxora, Melodia, dan Verona
- Galeri interior serta informasi fasilitas
- Artikel properti dan formulir kontak PHP

## Teknologi

HTML, Tailwind CSS 4, JavaScript, PHP / PHPMailer.

## Menjalankan secara lokal

Gunakan server Apache/PHP, misalnya XAMPP. Tempatkan salinan proyek pada document root dan buka `beranda.html` melalui localhost. Aturan `.htaccess`, jika tersedia, membutuhkan Apache dengan konfigurasi yang sesuai.

Jalankan `composer install` untuk memasang PHPMailer.

Untuk membangun stylesheet, jalankan `npm ci` lalu `npm run build`.

## Versi proyek

Versi ini disimpan sebagai proyek lokal. Website live menggunakan [Grand Ontama redesign](https://github.com/bagus-mahmudie/grand-ontama).

## Konfigurasi privat

Salin template berikut ke nama file lokalnya, lalu isi nilai untuk lingkungan Anda:

| Template | File lokal |
| --- | --- |
| `mailer/config.example.php` | `mailer/config.php` |

File konfigurasi lokal diabaikan oleh Git. Jangan memasukkan password, API key, atau data akun ke source code.

## Catatan repository

Dependensi terpasang, cache, file `.env`, database, dan unggahan pengguna tidak disertakan. Nama merek dan aset pihak ketiga tetap mengikuti hak pemiliknya. Tidak ada lisensi penggunaan ulang yang diberikan melalui repository ini.
