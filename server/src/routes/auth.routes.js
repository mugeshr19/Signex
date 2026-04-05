const router = require("express").Router();
const { register,login,logout,getme,rotateapi,savewebhook } = require("../controllers/auth.controller");
const authenticatejwt = require("../middlewares/jwt.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticatejwt , getme);
router.post("/rotate-api-key", authenticatejwt , rotateapi);
router.post("/webhook",authenticatejwt,savewebhook);

module.exports = router;
