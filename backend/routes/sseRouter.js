const express = require("express");
const { injectTokenFromQuery, authRequired } = require("../middleware/auth");
const sseController = require("../controllers/sseController");

const router = express.Router();

router.get("/", injectTokenFromQuery, authRequired, sseController.connect);

module.exports = router;