/**
 * Utility functions to standardize API response formats
 */

const config = require("../config/config");

/**
 * Generates a standardized success response
 * 
 * @param {Object} data - The data to include in the response
 * @param {String} message - Optional custom success message
 * @returns {Object} Formatted success response
 */
const successResponse = (data = {}, message = "Success") => {
  return {
    data,
    statusMessage: message,
    statusCode: config.statusCodes.success
  };
};

/**
 * Generates a standardized error response
 * 
 * @param {String} errorCode - Error code from config
 * @param {String} errorMessage - Human-readable error message
 * @returns {Object} Formatted error response
 */
const errorResponse = (errorCode, errorMessage) => {
  return {
    data: {
      errorMessage,
      errorCode,
      redirectionURL: ""
    },
    statusMessage: "Error",
    statusCode: config.statusCodes.error
  };
};

/**
 * Generates a standardized validation error response
 * 
 * @param {String} errorMessage - Description of the validation error
 * @returns {Object} Formatted validation error response
 */
const validationError = (errorMessage) => {
  return errorResponse(config.errorCodes.missingParameters, errorMessage);
};

/**
 * Generates a standardized authentication error response
 * 
 * @param {String} errorMessage - Description of the authentication error
 * @returns {Object} Formatted authentication error response
 */
const authError = (errorMessage) => {
  return errorResponse(config.errorCodes.invalidToken, errorMessage);
};

/**
 * Generates a standardized server error response
 * 
 * @param {Error} error - Error object
 * @returns {Object} Formatted server error response
 */
const serverError = (error) => {
  const errorMessage = process.env.NODE_ENV === "production" 
    ? "Internal server error" 
    : error.message || "Unknown server error";
  
  return errorResponse(config.errorCodes.serverError, errorMessage);
};

/**
 * Generates a standard redirection response
 * 
 * @param {String} redirectionURL - URL to redirect the client to
 * @returns {Object} Formatted success response with redirection URL
 */
const redirectionResponse = (redirectionURL) => {
  return successResponse({
    errorMessage: "",
    errorCode: "",
    redirectionURL
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationError,
  authError,
  serverError,
  redirectionResponse
};