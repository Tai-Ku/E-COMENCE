const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    if (connection.connection.readyState == 1)
      console.log("DB connection successfully");
    else console.log("failed to connect");
  } catch (error) {
    console.log("DB connection error");
    throw new Error(error);
  }
};
module.exports = dbConnect;
