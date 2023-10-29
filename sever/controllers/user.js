const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName)
    return res.status(400).json({
      success: false,
      message: "Missing inputs",
    });

  const user = await User.findOne({ email });
  if (user) {
    throw new Error("User already exists in the system");
  } else {
    const newUser = await User.create(req.body);
    return res.status(200).json({
      success: newUser ? true : false,
      mes: newUser
        ? "Register is successfully. Please go login"
        : "Something went wrong",
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      success: false,
      message: "Missing inputs",
    });

  const response = await User.findOne({ email });

  if (response && (await response.isCorrectPassword(password))) {
    const { password, role, ...userData } = response.toObject();
    return res.status(200).json({
      success: true,
      userData,
    });
  } else {
    throw new Error("Invalid credentials!");
  }
});

module.exports = {
  register,
  login,
};
