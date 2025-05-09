/**
 * Configuration settings for the Loan Offer API service
 */

// Environment configuration
const env = process.env.NODE_ENV || "development";

// Base configuration object
const config = {
  // Server settings
  server: {
    port: process.env.PORT || 3000,
    baseUrl: process.env.BASE_URL || "http://localhost:3000"
  },
  
  // API endpoints
  endpoints: {
    loanOffer: "/fkApiServices.do?action=loanOffer"
  },
  
  // Status codes
  statusCodes: {
    success: "SR",  // Success response
    error: "ER"     // Error response
  },
  
  // Error codes
  errorCodes: {
    invalidToken: "E001",
    missingParameters: "E002",
    invalidLoanAmount: "E003",
    invalidTenure: "E004",
    serverError: "E999"
  },
  
  // Auth settings
  auth: {
    tokenExpiryTime: 3600, // seconds
    tokenSecret: process.env.TOKEN_SECRET || "loanOfferServiceSecretKey"
  },
  
  // Loan processing settings
  loan: {
    minAmount: 10000,
    maxAmount: 10000000,
    minTenure: 3,   // months
    maxTenure: 84,  // months
    minRoi: 5.5,    // percentage
    maxRoi: 24.0    // percentage
  },
  
  // Validation settings
  validation: {
    orderIdRegex: /^ORD[0-9]{6,10}$/,
    transactionIdRegex: /^TXN[0-9]{4,12}$/
  }
};

// Environment-specific overrides
const environmentConfigs = {
  development: {
    // Development-specific settings
    debug: true,
    logLevel: "debug"
  },
  
  test: {
    // Test environment settings
    debug: true,
    logLevel: "info"
  },
  
  production: {
    // Production environment settings
    debug: false,
    logLevel: "error",
    server: {
      port: process.env.PORT || 8080
    }
  }
};

// Merge the base config with environment-specific settings
const mergedConfig = { 
  ...config, 
  ...(environmentConfigs[env] || {}),
  environment: env
};

module.exports = mergedConfig;