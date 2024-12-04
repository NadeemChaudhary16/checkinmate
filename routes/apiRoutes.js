const express = require("express");
const { handleRegistration } = require("../controllers/registerController");
const { handleCheckIn } = require("../controllers/checkInController");
const { handleCheckOut } = require("../controllers/checkOutController");

const router = express.Router();

router.post("/register", handleRegistration);
router.post("/check-in", handleCheckIn);
router.post("/check-out", handleCheckOut);

module.exports = { apiRoutes: router };
