
import { registerUser, loginUser } from "./auth.service.js";

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body || {};

    // Required field validation
    if (!name || !username || !email || !password) {
      throw createValidationError("All fields are required.");
    }

    // Type validation
    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      throw createValidationError("Invalid input types.");
    }

    // Normalize user input
    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanUsername || !cleanEmail) {
      throw createValidationError("Fields cannot contain only spaces.");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      throw createValidationError("Please provide a valid email.");
    }

    // Password validation
    if (password.length < 8) {
      throw createValidationError(
        "Password must contain at least 8 characters."
      );
    }

    const user = await registerUser({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw createValidationError(
        "Email and password are required."
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      throw createValidationError("Invalid input types.");
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw createValidationError("Email and password are required.");
    }

    const result = await loginUser({
      email: cleanEmail,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};


export { register, login, getCurrentUser };