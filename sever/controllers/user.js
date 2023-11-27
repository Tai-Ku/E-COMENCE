const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const jwt = require("jsonwebtoken");
const sendMail = require("../ultils/sendMail");
const crypto = require("crypto");

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

// refresh
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
    // create accessToken
    const accessToken = generateAccessToken(response._id, role);
    // create refreshToken
    const refreshToken = generateRefreshToken(response._id);

    await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true });

    //luu refresh token vao cokkies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      userData,
    });
  } else {
    throw new Error("Invalid credentials!");
  }
});

const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  // không muốn trả về 3 trường refreshToken password role
  const user = await User.findById(_id).select("-refreshToken -password -role");

  return res.status(200).json({
    success: user ? true : false,
    mes: user ? user : "User not found",
  });
});

const refreshTokenAccessToken = asyncHandler(async (req, res) => {
  // Lấy token từ cookies
  const cookie = req.cookies;
  // check xem có token hay không
  if (!cookie && !cookie.refreshToken)
    throw new Error("No refresh token in cookies");
  // check token có còn hạn hay không

  const result = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({
    _id: result._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response._id, response.role)
      : "Refresh token not matched",
  });
});

const logOut = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh token in cookies");
  // Xoá refresh token ở db
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  // Xoá refresh token ở cookie trình duyệt

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({ success: true, mes: "Logout is done" });
});

// Reset PassWord

// client gửi email
// sever check email có tồn tài hay không -> gửi mail+link(pass chang token)
// client check mail -> click link email
// check xem token đã gửi  có giống sever đã gửi hay không

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) throw new Error("Missing email");

  const user = await User.findOne({ email: email });
  if (!user) throw new Error("User not found");

  const resetToken = user.createPasswordChangedToken();
  await user.save();

  const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15ph <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here<a>`;
  const data = {
    email,
    html: html,
  };
  const result = await sendMail(data);
  return res.status(200).json({
    success: true,
    result,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!password || !token) throw new Error("Missing inputs");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) throw new Error("Invalid password reset token");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordResetExpire = undefined;
  await user.save();
  return res.status(200).json({
    success: user ? true : false,
    message: user ? "Updated pass" : "Something went wrong",
  });
});

module.exports = {
  register,
  login,
  getCurrent,
  refreshTokenAccessToken,
  logOut,
  forgotPassword,
  resetPassword,
};
