const User = require("../models/User");
const { BadRequestError, UnauthorizedError, AppError } = require("../../utils/errorHandler");
const { generateToken } = require("../helpers/authHelpers");
const { ERROR_MESSAGES } = require("../constants");

exports.registerUser = async (name, email, password) => {
  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    throw new BadRequestError(ERROR_MESSAGES.USER_EXISTS);
  }

  // Create new user
  user = await User.create({ name, email, password });
  return user;
};

exports.loginUser = async (email, password) => {
  // Check for user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Return user without password
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  return userObj;
};

exports.handleGoogleLogin = (user) => {
    // User object comes from passport middleware
    if (!user) {
        throw new AppError(ERROR_MESSAGES.GOOGLE_AUTH_FAILED, 500);
    }
    // Generate JWT for the user (photo info might be on user object from passport)
    const token = generateToken(user._id || user.id, { photo: user.photo });
    return token;
}; 