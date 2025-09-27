const axios = require("axios")

module.exports = {
  name: "YTMP3",
  desc: "Download audio MP3 dari link YouTube",
  category: "Downloader",
  params: ["url"],
  async run(req, res) {
    const { url } = req.query

    if (!url || !url.includes("youtu")) {
      return res.status(400).json({
        status: false,
        error: 'Parameter "url" wajib diisi dan harus link YouTube!',
      })
    }

    try {
      const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}`
      const response = await axios.get(apiUrl)
      const data = response.data

      if (!data || data.status !== 200 || !data.result) {
        return res.status(500).json({
          status: false,
          error: "Gagal memproses permintaan.",
        })
      }

      const result = data.result

      // meta info
      const meta = {
        title: result.title || "-",
        duration: result.duration || "-",
        size: result.filesize ? (result.filesize / 1024 / 1024).toFixed(2) + " MB" : "-",
        status: result.status || "-",
        progress: result.progress || 0,
      }

      res.setHeader("Content-Type", "application/json")
      return res.json({
        status: true,
        meta,
        download: {
          title: result.title || "audio",
          url: result.link,
          mimeType: "audio/mpeg",
        },
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        status: false,
        error: "Gagal memproses permintaan.",
        message: err.message,
      })
    }
  },
}
