const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mobile REST API",
      version: "1.0.0",
      description: "Mobile-optimized REST API dengan sistem plugin yang mendukung semua media types",
      contact: {
        name: "API Support",
        email: "support@hookrest.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://your-domain.com"
            : `http://localhost:${process.env.PORT || 3355}`,
        description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            status: { type: "boolean", example: true },
            statusCode: { type: "number", example: 200 },
            creator: { type: "string", example: "hookrest" },
            timestamp: { type: "string", format: "date-time" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "boolean", example: false },
            statusCode: { type: "number", example: 400 },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./api/*.js"], // Path to the API files
}

// Generate Swagger documentation from plugins
function generateSwaggerFromPlugins(plugins) {
  const paths = {}

  plugins.forEach((plugin, name) => {
    const endpoint = `/api/${name}`
    const parameters = (plugin.params || []).map((param) => ({
      name: param,
      in: "query",
      required: true,
      schema: { type: "string" },
      description: `Parameter ${param} untuk ${plugin.desc || plugin.name}`,
    }))

    paths[endpoint] = {
      get: {
        tags: [plugin.category || "General"],
        summary: plugin.desc || plugin.name,
        description: `${plugin.desc || plugin.name} - Mobile optimized endpoint`,
        parameters,
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
              "image/*": {
                schema: { type: "string", format: "binary" },
              },
              "audio/*": {
                schema: { type: "string", format: "binary" },
              },
              "video/*": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
          400: {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    }
  })

  return {
    ...swaggerOptions.definition,
    paths,
  }
}

// Custom Swagger UI options for mobile
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { 
      color: #8b5cf6; 
      font-size: 2rem; 
      font-weight: bold;
    }
    .swagger-ui .scheme-container { 
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .swagger-ui .opblock.opblock-get { 
      border-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.1);
    }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { 
      background: #8b5cf6;
    }
    .swagger-ui .btn.authorize { 
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      border: none;
    }
    .swagger-ui .response-col_status { color: #8b5cf6; }
    
    /* Mobile optimizations */
    @media (max-width: 768px) {
      .swagger-ui .wrapper { padding: 10px; }
      .swagger-ui .info .title { font-size: 1.5rem; }
      .swagger-ui .opblock { margin: 10px 0; }
      .swagger-ui .opblock-summary { padding: 10px; }
      .swagger-ui .parameters-col_description { display: none; }
      .swagger-ui .response-col_links { display: none; }
    }
  `,
  customSiteTitle: "Mobile REST API Documentation",
  customfavIcon: "/icon.png",
}

module.exports = {
  generateSwaggerFromPlugins,
  swaggerUi,
  swaggerUiOptions,
}
