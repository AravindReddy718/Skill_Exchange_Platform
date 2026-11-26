
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async ({ name, username, email, password }) => {
  // Normalize user input
  const cleanName = name.trim();
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  // Check for existing email or username
  const existingUser = await User.findOne({
    $or: [
      { email: cleanEmail },
      { username: cleanUsername },
    ],
  });

  if (existingUser) {
    const error = new Error("Email or username already exists.");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    return {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    // Handle duplicate-key errors caused by concurrent registrations
    if (error.code === 11000) {
      const duplicateError = new Error(
        "Email or username already exists."
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};

const loginUser = async ({ email, password }) => {
  const cleanEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (user.isSuspended) {
    const error = new Error("Your account has been suspended.");
    error.statusCode = 403;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

export { registerUser, loginUser };
