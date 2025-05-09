/**
 * Controller for handling loan offer API requests
 */

const loanService = require("../services/loanService");
const responseHelper = require("../utils/responseHelper");

/**
 * Handle the POST request for loan offer
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processLoanOfferRequest = (req, res) => {
  try {
    // Check if request body exists
    if (!req.body) {
      return res.status(400).json(
        responseHelper.validationError("Request body is missing")
      );
    }

    // Extract request data
    const { token, data } = req.body;

    // Validate basic request structure
    if (!token) {
      return res.status(401).json(
        responseHelper.authError("Authentication token is missing")
      );
    }

    if (!data) {
      return res.status(400).json(
        responseHelper.validationError("Loan request data is missing")
      );
    }

    // Process the loan offer request using the service layer
    const response = loanService.processLoanOffer(req.body);
    
    // Determine HTTP status based on response
    const httpStatus = response.statusCode === "SR" ? 200 : 400;
    
    // Send response
    return res.status(httpStatus).json(response);
    
  } catch (error) {
    console.error("Error in loan offer controller:", error);
    return res.status(500).json(responseHelper.serverError(error));
  }
};

/**
 * Validate the loan details and return validation errors if any
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateLoanDetails = (req, res) => {
  try {
    // Extract request data
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json(
        responseHelper.validationError("Loan data is missing")
      );
    }
    
    // Validate the loan request data
    const validationResult = loanService.validateLoanRequest(data);
    
    if (!validationResult.isValid) {
      return res.status(400).json(
        responseHelper.errorResponse(validationResult.errorCode, validationResult.message)
      );
    }
    
    // If validation is successful
    return res.status(200).json(
      responseHelper.successResponse({ 
        message: "Loan details are valid",
        valid: true 
      })
    );
    
  } catch (error) {
    console.error("Error validating loan details:", error);
    return res.status(500).json(responseHelper.serverError(error));
  }
};

/**
 * Calculate loan EMI and generate amortization schedule
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateLoanDetails = (req, res) => {
  try {
    const { loanAmount, roi, tenure } = req.body;
    
    // Validate required parameters
    if (!loanAmount || !roi || !tenure) {
      return res.status(400).json(
        responseHelper.validationError("Missing required parameters: loanAmount, roi, tenure")
      );
    }
    
    // Parse parameters to ensure they are numbers
    const parsedAmount = parseFloat(loanAmount);
    const parsedRoi = parseFloat(roi);
    const parsedTenure = parseInt(tenure, 10);
    
    // Validate numeric values
    if (isNaN(parsedAmount) || isNaN(parsedRoi) || isNaN(parsedTenure)) {
      return res.status(400).json(
        responseHelper.validationError("Invalid numeric parameters provided")
      );
    }
    
    // Calculate EMI
    const emi = loanService.calculateEMI(parsedAmount, parsedRoi, parsedTenure);
    
    // Generate amortization schedule
    const schedule = loanService.generateAmortizationSchedule(
      parsedAmount, parsedRoi, parsedTenure
    );
    
    // Return the calculated details
    return res.status(200).json(
      responseHelper.successResponse({
        emi,
        totalInterest: schedule.reduce((sum, entry) => sum + entry.interestPaid, 0),
        totalAmount: emi * parsedTenure,
        schedule
      })
    );
    
  } catch (error) {
    console.error("Error calculating loan details:", error);
    return res.status(500).json(responseHelper.serverError(error));
  }
};

module.exports = {
  processLoanOfferRequest,
  validateLoanDetails,
  calculateLoanDetails
};