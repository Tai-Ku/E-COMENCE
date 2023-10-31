const router = require("express").Router();
const controller = require("../controllers/user");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/current", verifyAccessToken, controller.getCurrent);
router.post("/refresh-token", controller.refreshTokenAccessToken);
router.get("/logout", controller.logOut);

module.exports = router;

// CRUD | POST-GET-PUT-DELETE
