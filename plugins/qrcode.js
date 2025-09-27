module.exports = {
  name: "QRCode",
  desc: "Generate QR Code dari text atau URL",
  category: "Generator",
  params: ["text"],
  async run(req, res) {
    const { text, size = "200" } = req.query

    if (!text) {
      return res.status(400).json({
        status: false,
        error: 'Parameter "text" wajib diisi!',
      })
    }

    try {
      // Using QR Server API for demo
      const qrSize = Math.min(Math.max(Number.parseInt(size), 100), 500)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(text)}`

      const meta = {
        text: text,
        size: `${qrSize}x${qrSize}`,
        format: "PNG",
        encoding: "UTF-8",
      }

      return res.json({
        status: true,
        meta,
        data: {
          qr_code_url: qrUrl,
          original_text: text,
          dimensions: `${qrSize}x${qrSize}`,
        },
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        status: false,
        error: "Gagal generate QR Code.",
        message: err.message,
      })
    }
  },
}
