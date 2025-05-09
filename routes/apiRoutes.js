/**
 * API Routes for the Loan Offer Service
 * Defines route handlers and links them to controller functions
 */

const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const authMiddleware = require("../middleware/authMiddleware");
const config = require("../config/config");

/**
 * Health Check Route
 * GET /api/health
 * Simple route to check if the API is running
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    environment: config.environment
  });
});

/**
 * Loan Offer API Endpoint
 * POST /fkApiServices.do?action=loanOffer
 * Processes loan offer requests as specified in the API docs
 */
router.post("/fkApiServices.do", (req, res, next) => {
  const action = req.query.action;
  
  if (action === "loanOffer") {
    // Apply authentication middleware for this route
    authMiddleware.authenticateToken(req, res, () => {
      // If authentication passed, process the loan offer request
      loanController.processLoanOfferRequest(req, res);
    });
  } else {
    // If the action is not supported
    res.status(400).json({
      statusCode: config.statusCodes.error,
      statusMessage: "Error",
      data: {
        errorMessage: "Unsupported action parameter",
        errorCode: config.errorCodes.missingParameters,
        redirectionURL: ""
      }
    });
  }
});

/**
 * Validate Loan Details
 * POST /api/loan/validate
 * Validates loan details without processing a full loan offer
 * Useful for client-side validation before submission
 */
router.post("/api/loan/validate", 
  authMiddleware.authenticateToken, 
  loanController.validateLoanDetails
);

/**
 * Calculate Loan EMI and Schedule
 * POST /api/loan/calculate
 * Calculates EMI and generates amortization schedule for given loan parameters
 */
router.post("/api/loan/calculate", loanController.calculateLoanDetails);

/**
 * Admin Routes
 * These routes require admin privileges
 */
// Example admin route that requires both authentication and admin privileges
router.get("/api/admin/loan-stats", 
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  (req, res) => {
    // This would typically fetch statistics from a database
    // For now, returning mock data
    res.status(200).json({
      statusCode: config.statusCodes.success,
      statusMessage: "Success",
      data: {
        totalLoans: 1245,
        totalAmount: 45678900,
        avgInterestRate: 12.5,
        avgTenure: 36
      }
    });
  }
);

/**
 * Error handling for routes that don't exist
 * This must be the last route
 */
router.all("*", (req, res) => {
  res.status(404).json({
    statusCode: config.statusCodes.error,
    statusMessage: "Error",
    data: {
      errorMessage: "Requested resource not found",
      errorCode: "E404",
      redirectionURL: ""
    }
  });
});

module.exports = router;