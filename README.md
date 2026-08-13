# Mrzkyzdnii Akinator

Website permainan Akinator berbahasa Indonesia dengan desain **Ruang Baca Aneh**. Proyek ini memakai `@aqul/akinator-api` pada fungsi Node.js agar sesi permainan tidak bergantung pada browser tertentu.

## Struktur

| Folder/File | Fungsi |
|---|---|
| `public/` | Tampilan HTML, CSS, JavaScript, dan aset ilustrasi. |
| `api/akinator.js` | Endpoint Node.js untuk mulai, menjawab, dan kembali pada sesi Akinator. |
| `vercel.json` | Konfigurasi deployment minimal; Vercel mendeteksi fungsi di `api/` secara otomatis. |

## Deploy ke Vercel

1. Ekstrak ZIP ini lalu unggah foldernya ke GitHub, atau impor folder langsung dari Vercel.
2. Vercel akan memasang dependency dari `package.json` secara otomatis.
3. Tidak diperlukan environment variable atau database.
4. Deploy menggunakan pengaturan default. Endpoint permainan berada di `/api/akinator`.

## Catatan

Sesi permainan diteruskan secara stateless antara browser dan fungsi serverless, sehingga alur mulai, jawab, dan kembali tetap cocok untuk deployment Vercel.
