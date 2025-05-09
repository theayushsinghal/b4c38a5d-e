/**
 * index.js
 * Entry point for the Loan Offer API Service
 * This file configures and starts the Node.js server
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./routes/apiRoutes");
const config = require("./config/config");

// Initialize Express app
const app = express();

// Configure middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Add request logging
const logFormat = config.environment === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

// Set timeout for all requests
app.use((req, res, next) => {
  // Set request timeout to 30 seconds
  req.setTimeout(30000);
  next();
});

// Add global error handler middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    statusCode: config.statusCodes.error,
    statusMessage: "Error",
    data: {
      errorMessage: "An internal server error occurred",
      errorCode: config.errorCodes.serverError,
      redirectionURL: ""
    }
  });
});

// Apply API routes
app.use("/", apiRoutes);

// Start the server
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`
    ======================================================
    🚀 Loan Offer API Service started successfully!
    🌐 Server listening on port ${PORT}
    🔧 Environment: ${config.environment}
    ======================================================
  `);
  
  // Log available endpoints
  console.log("📝 Available endpoints:");
  console.log(`   POST ${config.endpoints.loanOffer}`);
  console.log("   GET /health");
  console.log("   POST /api/loan/validate");
  console.log("   POST /api/loan/calculate");
  
  if (config.environment === "development") {
    console.log("\n⚙️  Development mode enabled");
    console.log("   Additional debugging information will be displayed");
  }
});

// Handle termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

/**
 * Gracefully shutdown the server
 */
function gracefulShutdown() {
  console.log("\n🛑 Received termination signal. Shutting down gracefully...");
  
  // Close server connections
  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
  
  // If server hasn't closed in 10 seconds, force shutdown
  setTimeout(() => {
    console.error("⚠️  Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
}

// Export app for testing purposes
module.exports = app;