/**
 * Service layer that handles the core loan offer processing logic and validation
 */

const config = require("../config/config");
const responseHelper = require("../utils/responseHelper");

/**
 * Validates token from the request
 * 
 * @param {String} token - Authentication token
 * @returns {Boolean} Whether the token is valid
 */
const validateToken = (token) => {
  // In a real implementation, this would verify the token
  // against a database or auth service
  
  // For this implementation, we'll do a simple check
  return token && token.length >= 32;
};

/**
 * Validates loan request parameters
 * 
 * @param {Object} data - Loan request data
 * @returns {Object} Validation result with isValid flag and error message
 */
const validateLoanRequest = (data) => {
  // Check if all required fields exist
  const requiredFields = [
    "orderId", 
    "transactionId", 
    "loanAmount", 
    "roi", 
    "tenure", 
    "downpayment",
    "processingFee",
    "tvsTransactionId"
  ];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      return {
        isValid: false,
        errorCode: config.errorCodes.missingParameters,
        message: `Missing required parameter: ${field}`
      };
    }
  }
  
  // Validate order ID format
  if (!config.validation.orderIdRegex.test(data.orderId)) {
    return {
      isValid: false,
      errorCode: config.errorCodes.missingParameters,
      message: "Order ID format is invalid"
    };
  }
  
  // Validate transaction ID format
  if (!config.validation.transactionIdRegex.test(data.transactionId)) {
    return {
      isValid: false,
      errorCode: config.errorCodes.missingParameters,
      message: "Transaction ID format is invalid"
    };
  }
  
  // Validate loan amount
  if (typeof data.loanAmount !== "number" || 
      data.loanAmount < config.loan.minAmount || 
      data.loanAmount > config.loan.maxAmount) {
    return {
      isValid: false,
      errorCode: config.errorCodes.invalidLoanAmount,
      message: `Loan amount must be between ${config.loan.minAmount} and ${config.loan.maxAmount}`
    };
  }
  
  // Validate tenure
  if (typeof data.tenure !== "number" || 
      data.tenure < config.loan.minTenure || 
      data.tenure > config.loan.maxTenure) {
    return {
      isValid: false,
      errorCode: config.errorCodes.invalidTenure,
      message: `Tenure must be between ${config.loan.minTenure} and ${config.loan.maxTenure} months`
    };
  }
  
  // Validate ROI
  if (typeof data.roi !== "number" || 
      data.roi < config.loan.minRoi || 
      data.roi > config.loan.maxRoi) {
    return {
      isValid: false,
      errorCode: config.errorCodes.missingParameters,
      message: `ROI must be between ${config.loan.minRoi}% and ${config.loan.maxRoi}%`
    };
  }
  
  // Validate downpayment
  if (typeof data.downpayment !== "number" || data.downpayment < 0) {
    return {
      isValid: false,
      errorCode: config.errorCodes.missingParameters,
      message: "Downpayment must be a non-negative number"
    };
  }
  
  return {
    isValid: true,
    message: ""
  };
};

/**
 * Processes a loan offer request
 * 
 * @param {Object} requestData - The complete request object
 * @returns {Object} Response object with appropriate status
 */
const processLoanOffer = (requestData) => {
  try {
    // Validate token
    if (!validateToken(requestData.token)) {
      return responseHelper.authError("Invalid or expired token");
    }
    
    // Validate request data
    const validationResult = validateLoanRequest(requestData.data);
    if (!validationResult.isValid) {
      return responseHelper.errorResponse(
        validationResult.errorCode, 
        validationResult.message
      );
    }
    
    // In a real implementation, this would:
    // 1. Process the loan request
    // 2. Store loan details in a database
    // 3. Generate any necessary documents or references
    // 4. Potentially integrate with other financial systems
    
    // For this implementation, we'll return a successful response
    // with empty values as specified in the API documentation
    return responseHelper.successResponse({
      errorMessage: "",
      errorCode: "",
      redirectionURL: requestData.data.backRedirectionURL || ""
    });
  } catch (error) {
    console.error("Error processing loan offer:", error);
    return responseHelper.serverError(error);
  }
};

/**
 * Calculates EMI for a loan
 * 
 * @param {Number} principal - Loan amount
 * @param {Number} roi - Rate of interest (annual percentage)
 * @param {Number} tenure - Loan term in months
 * @returns {Number} Monthly EMI amount
 */
const calculateEMI = (principal, roi, tenure) => {
  // Convert annual interest rate to monthly and decimal form
  const monthlyRate = roi / (12 * 100);
  
  // Calculate EMI using formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) 
              / (Math.pow(1 + monthlyRate, tenure) - 1);
  
  return Math.round(emi * 100) / 100; // Round to 2 decimal places
};

/**
 * Generates an amortization schedule for a loan
 * 
 * @param {Number} principal - Loan amount
 * @param {Number} roi - Rate of interest (annual percentage)
 * @param {Number} tenure - Loan term in months
 * @returns {Array} Array of monthly payment details
 */
const generateAmortizationSchedule = (principal, roi, tenure) => {
  const monthlyRate = roi / (12 * 100);
  const emi = calculateEMI(principal, roi, tenure);
  const schedule = [];
  
  let balance = principal;
  
  for (let month = 1; month <= tenure; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    
    schedule.push({
      month,
      emi: Math.round(emi * 100) / 100,
      principalPaid: Math.round(principalPaid * 100) / 100,
      interestPaid: Math.round(interest * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100)
    });
  }
  
  return schedule;
};

module.exports = {
  processLoanOffer,
  validateToken,
  validateLoanRequest,
  calculateEMI,
  generateAmortizationSchedule
};