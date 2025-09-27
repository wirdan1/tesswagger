const express = require("express")
const fs = require("fs")
const path = require("path")
const os = require("os")
const app = express()
const PORT = process.env.PORT || 3355

const { generateSwaggerFromPlugins, swaggerUi, swaggerUiOptions } = require("./swagger")

// Logger utility
const logger = {
  info: (message) => console.log("• info  - " + message),
  ready: (message) => console.log("• ready - " + message),
  warn: (message) => console.log("• warn  - " + message),
  error: (message) => console.log("• error - " + message),
  event: (message) => console.log("• event - " + message),
}

// Express configuration
app.set("trust proxy", true)
app.set("json spaces", 2)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

logger.info("Starting server initialization...")

// Static file serving
app.use(express.static(path.join(__dirname, "public")))
app.use("/docs", express.static(path.join(__dirname, "docs")))
app.use("/image", express.static(path.join(__dirname, "docs", "image")))

// Response formatting middleware
app.use((req, res, next) => {
  const originalJson = res.json
  res.json = function (data) {
    if (data && typeof data === "object") {
      const statusCode = res.statusCode || 200
      const responseData = {
        status: data.status !== false,
        statusCode: statusCode,
        creator: "hookrest",
        timestamp: new Date().toISOString(),
        ...data,
      }
      return originalJson.call(this, responseData)
    }
    return originalJson.call(this, data)
  }
  next()
})

// Plugin system
const plugins = new Map()

function loadEndpointsFromDirectory(directory, baseRoute = "") {
  let endpoints = []
  const fullPath = path.join(__dirname, directory)

  if (!fs.existsSync(fullPath)) {
    logger.warn(`Directory not found: ${fullPath}`)
    return endpoints
  }

  logger.info(`Scanning directory: ${directory}...`)
  const items = fs.readdirSync(fullPath)

  items.forEach((item) => {
    const itemPath = path.join(fullPath, item)
    const stats = fs.statSync(itemPath)

    if (stats.isDirectory()) {
      logger.info(`Found subdirectory: ${item}`)
      const nestedEndpoints = loadEndpointsFromDirectory(path.join(directory, item), `${baseRoute}/${item}`)
      endpoints = [...endpoints, ...nestedEndpoints]
    } else if (stats.isFile() && item.endsWith(".js")) {
      try {
        const module = require(itemPath)
        if (module && module.run && typeof module.run === "function") {
          const endpointName = item.replace(".js", "")
          const endpointPath = `/api/${endpointName}`

          // Register plugin
          plugins.set(endpointName, module)

          app.all(endpointPath, module.run)

          let fullPathWithParams = endpointPath
          if (module.params && module.params.length > 0) {
            fullPathWithParams += "?" + module.params.map((param) => `${param}=`).join("&")
          }

          const category = module.category || "Other"
          const categoryIndex = endpoints.findIndex((endpoint) => endpoint.name === category)

          if (categoryIndex === -1) {
            endpoints.push({
              name: category,
              items: [],
            })
          }

          const categoryObj = endpoints.find((endpoint) => endpoint.name === category)
          const endpointObj = {}
          endpointObj[module.name || endpointName] = {
            desc: module.desc || "No description provided",
            path: fullPathWithParams,
            method: module.method || "GET",
            requiresApiKey: false,
          }

          categoryObj.items.push(endpointObj)
          logger.ready(`${endpointPath} (${category})`)
        }
      } catch (error) {
        logger.error(`Failed to load module ${itemPath}: ${error.message}`)
      }
    }
  })

  return endpoints
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get("/docs", (req, res) => {
  res.redirect("/api-docs")
})

app.get("/api/docs", (req, res) => {
  res.json(generateSwaggerFromPlugins(plugins))
})

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    ...swaggerUiOptions,
    swaggerOptions: {
      url: "/api/docs",
    },
  }),
)

app.get("/endpoints", (req, res) => {
  const allEndpoints = Array.from(plugins.values())
  const totalEndpoints = allEndpoints.length

  res.json({
    status: true,
    count: totalEndpoints,
    endpoints: allEndpoints.map((plugin) => ({
      name: plugin.name,
      desc: plugin.desc,
      category: plugin.category,
      params: plugin.params,
      endpoint: `/api/${plugin.name?.toLowerCase()}`,
    })),
  })
})

app.get("/image/icon.png", (req, res) => {
  const iconPath = path.join(__dirname, "public", "icon.png")
  if (fs.existsSync(iconPath)) {
    res.sendFile(iconPath)
  } else {
    res.status(404).send("Favicon not found")
  }
})

// Load API endpoints
logger.info("Loading API endpoints...")
const allEndpoints = loadEndpointsFromDirectory("api")
logger.ready(`Loaded ${allEndpoints.reduce((total, category) => total + category.items.length, 0)} endpoints`)

// 404 handler
app.use((req, res, next) => {
  logger.info(`404: ${req.method} ${req.path}`)
  res.status(404).json({
    status: false,
    error: "Endpoint not found",
    message: `${req.method} ${req.path} tidak ditemukan`,
  })
})

// Error handler
app.use((err, req, res, next) => {
  logger.error(`500: ${err.message}`)
  res.status(500).json({
    status: false,
    error: "Internal server error",
    message: err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log("")
  logger.ready("Server started successfully")
  logger.info(`Local: http://localhost:${PORT}`)

  try {
    const { networkInterfaces } = os
    const nets = networkInterfaces()
    const results = {}

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          if (!results[name]) {
            results[name] = []
          }
          results[name].push(net.address)
        }
      }
    }

    for (const [, addresses] of Object.entries(results)) {
      for (const addr of addresses) {
        logger.info(`Network: http://${addr}:${PORT}`)
      }
    }
  } catch (error) {
    logger.warn(`Cannot detect network interfaces: ${error.message}`)
  }

  logger.info("Ready for connections")
})

module.exports = app
