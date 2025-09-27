const qrcodePlugin = {
  name: "qrcode",
  desc: "Generate QR code from text or URL",
  category: "Utility",
  params: ["text"],
  method: "GET",

  async run(req, res) {
    try {
      const { text } = req.query

      if (!text) {
        return res.status(400).json({
          status: false,
          error: "Text parameter is required",
          message: "Silakan masukkan teks atau URL untuk di-generate",
        })
      }

      // Mock QR code response (replace with actual QR generation)
      const qrData = {
        text: text,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`,
        size: "200x200",
        format: "PNG",
        generated: new Date().toISOString(),
      }

      res.json({
        status: true,
        data: qrData,
        message: "QR Code generated successfully",
      })
    } catch (error) {
      console.error("QRCode Error:", error)
      res.status(500).json({
        status: false,
        error: "Internal server error",
        message: "Terjadi kesalahan saat membuat QR code",
      })
    }
  },
}

module.exports = qrcodePlugin
