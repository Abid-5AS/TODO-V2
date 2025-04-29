const jwt = require("jsonwebtoken");
const User = require("../auth/models/User");
require("dotenv").config();

const authenticateToken = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (id) and attach to request
      // Exclude password from the user object attached to req
      let userDoc = await User.findById(decoded.id).select("-password");

      if (!userDoc) {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized, user not found" });
      }

      // Convert to plain object and attach photo from JWT payload if available
      req.user = userDoc.toObject ? userDoc.toObject() : { ...userDoc }; // Ensure it's a plain object
      if (decoded.photo) {
        req.user.photo = decoded.photo;
      }

      console.log("[AuthMiddleware] req.user after photo attach:", req.user);

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Token verification failed:", error);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

module.exports = { authenticateToken };
