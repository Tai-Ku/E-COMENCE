const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbconnect");
const initRoutes = require("./routes");

const app = express();
const port = process.env.PORT || 8888;

app.use(express.json()); // để thèn express có thể hiểu được data được gửi lên từ phía client á là đọc theo kiểu json
app.use(express.urlencoded({ extended: true })); // giúp đọc được kiểu mảng hay là object
dbConnect();
initRoutes(app);

app.use("/", (req, res) => {
  res.send("SEVER ON");
});

app.listen(port, () => {
  console.log("listening on port " + port);
});
