// Mobile-optimized Swagger UI initialization
async function initSwagger() {
  try {
    console.log("[v0] Initializing mobile Swagger UI...")

    // Show loading state
    document.getElementById("swagger-ui").innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #6b7280;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
        <h3>Loading API Documentation...</h3>
        <p>Memuat dokumentasi API untuk mobile</p>
      </div>
    `

    // Fetch API documentation
    const response = await fetch("/api/docs")
    const swaggerDoc = await response.json()

    console.log("[v0] Swagger doc loaded:", swaggerDoc)

    // Initialize Swagger UI with mobile-optimized settings
    const SwaggerUIBundle = window.SwaggerUIBundle
    const SwaggerUIStandalonePreset = window.SwaggerUIStandalonePreset

    SwaggerUIBundle({
      url: "/api/docs",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      plugins: [SwaggerUIBundle.plugins.DownloadUrl],
      layout: "StandaloneLayout",
      validatorUrl: null,
      tryItOutEnabled: true,
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
      docExpansion: "list", // Better for mobile
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayOperationId: false,
      displayRequestDuration: true,
      requestInterceptor: (request) => {
        console.log("[v0] API Request:", request)
        // Add mobile user agent if needed
        request.headers["User-Agent"] = "Mobile-REST-API-Client/1.0"
        return request
      },
      responseInterceptor: (response) => {
        console.log("[v0] API Response:", response)
        // Handle different media types for mobile
        if (response.headers["content-type"]) {
          const contentType = response.headers["content-type"]
          if (contentType.includes("image/") || contentType.includes("audio/") || contentType.includes("video/")) {
            console.log("[v0] Media response detected:", contentType)
          }
        }
        return response
      },
      onComplete: () => {
        console.log("[v0] Swagger UI loaded successfully")
        // Add mobile-specific enhancements
        enhanceMobileExperience()
      },
    })

    // Update stats
    await updateStats(swaggerDoc)
  } catch (error) {
    console.error("[v0] Failed to initialize Swagger UI:", error)
    document.getElementById("swagger-ui").innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #ef4444;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
        <h3>Gagal memuat dokumentasi API</h3>
        <p>Pastikan server berjalan di port yang benar</p>
        <button onclick="initSwagger()" style="
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-weight: 600;
          cursor: pointer;
        ">Coba Lagi</button>
      </div>
    `
  }
}

// Enhanced mobile experience
function enhanceMobileExperience() {
  console.log("[v0] Enhancing mobile experience...")

  // Add touch-friendly improvements
  const executeButtons = document.querySelectorAll(".btn.execute")
  executeButtons.forEach((button) => {
    button.style.minHeight = "44px" // iOS touch target minimum
    button.style.fontSize = "16px" // Prevent zoom on iOS
  })

  // Add input improvements for mobile
  const inputs = document.querySelectorAll('input[type="text"]')
  inputs.forEach((input) => {
    input.style.fontSize = "16px" // Prevent zoom on iOS
    input.style.minHeight = "44px" // Touch-friendly
  })

  // Add swipe gestures for collapsible sections
  addSwipeGestures()
}

// Add swipe gestures for better mobile interaction
function addSwipeGestures() {
  let startY = 0
  let startX = 0

  document.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY
    startX = e.touches[0].clientX
  })

  document.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY
    const endX = e.changedTouches[0].clientX
    const diffY = startY - endY
    const diffX = startX - endX

    // Detect swipe gestures
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
      if (diffY > 0) {
        console.log("[v0] Swipe up detected")
      } else {
        console.log("[v0] Swipe down detected")
      }
    }
  })
}

// Update statistics with animation
async function updateStats(swaggerDoc) {
  try {
    const pathCount = Object.keys(swaggerDoc.paths || {}).length

    // Animate endpoint count
    animateNumber(document.getElementById("endpointCount"), pathCount)

    // Fetch and animate plugin count
    const response = await fetch("/endpoints")
    const data = await response.json()

    if (data.status) {
      animateNumber(document.getElementById("pluginCount"), data.count)
      console.log("[v0] Stats updated - Plugins:", data.count, "Endpoints:", pathCount)
    }
  } catch (error) {
    console.error("[v0] Failed to update stats:", error)
    // Set fallback values
    document.getElementById("pluginCount").textContent = "0"
    document.getElementById("endpointCount").textContent = "0"
  }
}

// Smooth number animation
function animateNumber(element, target) {
  const start = 0
  const duration = 1500
  const startTime = performance.now()

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function for smooth animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(start + (target - start) * easeOutCubic)

    element.textContent = current

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      element.textContent = target // Ensure final value is exact
    }
  }

  requestAnimationFrame(update)
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing mobile app...")

  // Add loading class to elements
  const elements = document.querySelectorAll(".stat-item, .swagger-wrapper")
  elements.forEach((element, index) => {
    element.classList.add("loading")
    element.style.animationDelay = `${index * 100}ms`
  })

  // Initialize Swagger UI
  initSwagger()

  // Add performance monitoring
  if ("performance" in window) {
    window.addEventListener("load", () => {
      const loadTime = performance.now()
      console.log("[v0] Page load time:", Math.round(loadTime), "ms")
    })
  }
})

// Add touch feedback for interactive elements
document.addEventListener("touchstart", (e) => {
  if (e.target.classList.contains("stat-item")) {
    e.target.style.transform = "scale(0.95)"
    e.target.style.transition = "transform 0.1s ease"
  }
})

document.addEventListener("touchend", (e) => {
  if (e.target.classList.contains("stat-item")) {
    setTimeout(() => {
      e.target.style.transform = "scale(1)"
    }, 100)
  }
})

// Handle orientation changes
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    console.log("[v0] Orientation changed, adjusting layout...")
    // Force a repaint to handle any layout issues
    document.body.style.display = "none"
    document.body.offsetHeight // Trigger reflow
    document.body.style.display = ""
  }, 100)
})

// Add connection status monitoring
window.addEventListener("online", () => {
  console.log("[v0] Connection restored")
  const indicator = document.querySelector(".status-indicator")
  if (indicator) {
    indicator.style.background = "#10b981"
  }
})

window.addEventListener("offline", () => {
  console.log("[v0] Connection lost")
  const indicator = document.querySelector(".status-indicator")
  if (indicator) {
    indicator.style.background = "#ef4444"
  }
})
