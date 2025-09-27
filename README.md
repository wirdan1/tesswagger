# 🚀 REST API with Swagger Documentation

REST API dengan sistem plugin yang dapat diperluas dan dokumentasi Swagger berwarna ungu.

## ✨ Fitur

- 🔌 **Sistem Plugin Dinamis** - Tambah endpoint baru dengan mudah
- 📚 **Dokumentasi Swagger Otomatis** - Tema ungu yang menarik
- 🎨 **UI Modern** - Desain responsif dengan gradient ungu
- ⚡ **Plugin Hot-Loading** - Tambah plugin tanpa restart server
- 🛡️ **Error Handling** - Penanganan error yang konsisten
- 📊 **Statistics Dashboard** - Monitor plugin dan endpoint

## 🚀 Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Jalankan server:**
   \`\`\`bash
   npm start
   # atau untuk development
   npm run dev
   \`\`\`

3. **Buka browser:**
   \`\`\`
   http://localhost:3000
   \`\`\`

## 🔌 Cara Membuat Plugin

Buat file baru di folder `plugins/` dengan format:

\`\`\`javascript
module.exports = {
  name: "NamaPlugin",
  desc: "Deskripsi plugin",
  category: "Kategori",
  params: ["param1", "param2"],
  async run(req, res) {
    const { param1, param2 } = req.query;
    
    // Logic plugin di sini
    
    return res.json({
      status: true,
      meta: { /* metadata */ },
      data: { /* response data */ }
    });
  }
};
\`\`\`

## 📋 Plugin yang Tersedia

- **YTMP3** - Download audio MP3 dari YouTube
- **Weather** - Informasi cuaca berdasarkan kota
- **QRCode** - Generate QR Code dari text/URL

## 🎨 Tema Swagger

Dokumentasi menggunakan tema ungu kustom dengan:
- Gradient ungu-biru yang elegan
- Animasi hover yang smooth
- Desain card modern dengan backdrop blur
- Typography yang mudah dibaca

## 📡 API Endpoints

- `GET /` - Halaman dokumentasi utama
- `GET /api/docs` - Swagger JSON specification
- `GET /api/plugins` - Daftar semua plugin
- `GET /api/{plugin-name}` - Endpoint dinamis untuk setiap plugin

## 🛠️ Teknologi

- **Backend**: Express.js
- **Frontend**: HTML5, CSS3, JavaScript
- **Documentation**: Swagger UI 5.9.0
- **Styling**: Custom CSS dengan gradient themes
