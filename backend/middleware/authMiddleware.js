const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      // 2. Check HTTP-only cookie
      token = req.cookies.token;
    } else if (req.query && req.query.token) {
      // 3. Check query param for direct inline PDF viewing tabs
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in first.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

module.exports = authMiddleware;