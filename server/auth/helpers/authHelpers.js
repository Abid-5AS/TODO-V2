const jwt = require("jsonwebtoken");
const { JWT_EXPIRATION, ERROR_MESSAGES } = require("../constants");

exports.generateToken = (id, extra = {}) => {
  const payload = { id, ...extra };
  if (!process.env.JWT_SECRET) {
    console.error("Fatal Error: JWT_SECRET is not defined.");
    throw new Error(ERROR_MESSAGES.JWT_SECRET_MISSING);
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}; 