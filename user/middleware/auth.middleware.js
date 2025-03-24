const axios = require('axios');

/**
 * Middleware to authenticate requests using the auth service
 * This middleware verifies the JWT token and sets req.userId if valid
 */
const authMiddleware = async (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Call the auth service to verify the token
    const response = await axios.get('http://auth:8080/api/v1/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // If verification is successful, set the user ID in the request
    if (response.data && response.data.success) {
      // Extract userId from the auth object set by Clerk middleware in the auth service
      // For now, we'll use a placeholder userId from the token
      // In a real implementation, this would be extracted from the token or the auth service response
      req.userId = parseInt(token.split('.')[0], 16) || 1; // Simple placeholder
      next();
    } else {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authMiddleware;