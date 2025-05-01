const jwt = require("jsonwebtoken");
const User = require("../auth/models/User");
require("dotenv").config();

const authenticateToken = async (req, res, next) => {
  console.log(`[AuthMiddleware] Request Path: ${req.path}`); // Log path
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      console.log("[AuthMiddleware] Token found in header."); // Log token found

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[AuthMiddleware] Token decoded successfully:", decoded);

      // Get user from the token payload (id) and attach to request
      // Exclude password from the user object attached to req
      let userDoc = await User.findById(decoded.id).select("-password");

      if (!userDoc) {
        console.error("[AuthMiddleware] User not found for decoded ID:", decoded.id);
        return res
          .status(401)
          .json({ success: false, message: "Not authorized, user not found" });
      }

      // Convert to plain object and attach photo from JWT payload if available
      req.user = userDoc.toObject ? userDoc.toObject() : { ...userDoc }; // Ensure it's a plain object
      if (decoded.photo) {
        req.user.photo = decoded.photo;
      }

      // console.log("[AuthMiddleware] req.user after photo attach:", req.user);
      console.log("[AuthMiddleware] User attached to req.user for path:", req.path);

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("[AuthMiddleware] Token verification failed:", error.message);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    console.error("[AuthMiddleware] No token found in Authorization header for path:", req.path);
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

module.exports = { authenticateToken };
