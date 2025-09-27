const ytmp3Plugin = {
  name: "ytmp3",
  desc: "Download YouTube video as MP3 audio file",
  category: "Media",
  params: ["url"],
  method: "GET",

  async run(req, res) {
    try {
      const { url } = req.query

      if (!url) {
        return res.status(400).json({
          status: false,
          error: "URL parameter is required",
          message: "Silakan masukkan URL YouTube yang valid",
        })
      }

      // Validate YouTube URL
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
      if (!youtubeRegex.test(url)) {
        return res.status(400).json({
          status: false,
          error: "Invalid YouTube URL",
          message: "URL harus berupa link YouTube yang valid",
        })
      }

      // Mock response for demo (replace with actual implementation)
      const mockData = {
        title: "Sample YouTube Video",
        duration: "3:45",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        downloadUrl: "https://example.com/download/sample.mp3",
        fileSize: "5.2 MB",
        quality: "128kbps",
      }

      res.json({
        status: true,
        data: mockData,
        message: "YouTube MP3 conversion ready",
        supportedFormats: ["mp3", "m4a", "wav"],
      })
    } catch (error) {
      console.error("YTMP3 Error:", error)
      res.status(500).json({
        status: false,
        error: "Internal server error",
        message: "Terjadi kesalahan saat memproses video YouTube",
      })
    }
  },
}

module.exports = ytmp3Plugin
