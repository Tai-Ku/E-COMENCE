const router = require("express").Router();
const controller = require("../controllers/user");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/current", verifyAccessToken, controller.getCurrent);

module.exports = router;
