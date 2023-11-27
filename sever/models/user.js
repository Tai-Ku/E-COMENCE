const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, //có nghĩa là không được trùng
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    cart: {
      type: Array,
      default: [],
    },
    address: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Address",
      },
    ],
    wishlist: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
    isBlocked: { type: Boolean, default: false },
    refreshToken: { type: String },
    passwordChangedAt: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpire: { type: String },
  },
  {
    timestamps: true,
  }
);

// khi có 1 hành động lưu  dữ liệu vào bảng thì nó sẽ chạy hàm này băm pass
userSchema.pre("save", async function (next) {
  // khi mà những  api nó không phải update thì nó sẽ bị trigger nên sẽ ngăn chụng nếu pass nó đã băm rồi thì sẽ next
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
  },
};

//Export the model
module.exports = mongoose.model("User", userSchema);
