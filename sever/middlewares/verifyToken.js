const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const verifyAccessToken = asyncHandler(async (req, res, next) => {
  // bởi vì token gửi lên có dạng Bearer đkkkkjkkjkjkjkjkj nên kiểm tra tra xem có phải bắt đầu bằng Bearer hay không

  // headers:{authorization:Bearer token  }
  if (req.headers?.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err)
        return res.status(401).json({
          success: false,
          mes: "Invalid access token",
        });
      req.user = decode;
      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      mes: "Required authorization!!",
    });
  }
});

module.exports = {
  verifyAccessToken,
};
