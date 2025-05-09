/**
 * Authentication middleware for the Loan Offer API
 * This middleware validates tokens and handles authentication for API requests
 */

const config = require("../config/config");
const responseHelper = require("../utils/responseHelper");
const crypto = require("crypto");

/**
 * Validates if a token is properly formatted
 * 
 * @param {String} token - The authentication token to validate
 * @returns {Boolean} Whether the token has valid format
 */
const isValidTokenFormat = (token) => {
  // Check if token exists and has the expected length
  return token && typeof token === "string" && token.length >= 32;
};

/**
 * Decodes and verifies the token
 * 
 * @param {String} token - The authentication token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    // In a production environment, this would typically:
    // 1. Verify the token signature using JWT or similar
    // 2. Check if the token is expired
    // 3. Potentially check a blacklist of revoked tokens
    
    // For this implementation, we're using a simplified approach
    // that checks token format and performs basic validation
    
    // Generate a hash of the token to compare with stored values
    const hash = crypto
      .createHmac("sha256", config.auth.tokenSecret)
      .update(token)
      .digest("hex");
    
    // In a real implementation, you would verify this hash against a database
    // For now, we're just checking if the token has valid format
    if (isValidTokenFormat(token)) {
      // Mock decoded payload
      return {
        valid: true,
        userId: "user_" + hash.substring(0, 10),
        issuedAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        expiresAt: Date.now() + 1000 * 60 * 30 // 30 minutes from now
      };
    }
    
    return null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

/**
 * Middleware that validates authentication token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateToken = (req, res, next) => {
  try {
    // Check if request contains a body
    if (!req.body) {
      return res.status(400).json(
        responseHelper.errorResponse(
          config.errorCodes.missingParameters,
          "Request body is missing"
        )
      );
    }
    
    // Get token from request body
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json(
        responseHelper.authError("Authentication token is missing")
      );
    }
    
    // Verify the token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return res.status(401).json(
        responseHelper.authError("Invalid or expired token")
      );
    }
    
    // Check if token is expired
    if (decodedToken.expiresAt < Date.now()) {
      return res.status(401).json(
        responseHelper.authError("Token has expired")
      );
    }
    
    // Attach decoded token to request object for use in subsequent middleware
    req.user = {
      id: decodedToken.userId,
      token: token
    };
    
    // Proceed to next middleware
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json(
      responseHelper.serverError(error)
    );
  }
};

/**
 * Middleware that checks if the user has admin privileges
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const requireAdmin = (req, res, next) => {
  // This would typically check if the authenticated user has admin role
  // For now, we'll implement a simplified check
  
  if (!req.user) {
    return res.status(401).json(
      responseHelper.authError("Authentication required")
    );
  }
  
  // In a real implementation, you would check user roles in a database
  // Here we're just checking a pattern in the user ID for demonstration
  const isAdmin = req.user.id.includes("admin");
  
  if (!isAdmin) {
    return res.status(403).json(
      responseHelper.errorResponse(
        "E403",
        "Insufficient permissions to perform this action"
      )
    );
  }
  
  next();
};

/**
 * Middleware for API rate limiting
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const rateLimiter = (req, res, next) => {
  // In a production environment, this would implement proper rate limiting
  // based on IP address, user ID, or other identifiers
  // For this implementation, we'll just pass through
  
  // Example of how rate limiting could be implemented:
  // 1. Check if user/IP has made too many requests in a time period
  // 2. If limit is exceeded, return 429 Too Many Requests
  // 3. Otherwise, update the request counter and proceed
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  rateLimiter,
  verifyToken,
  isValidTokenFormat
};