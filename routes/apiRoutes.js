const express = require("express");
const { handleRegistration } = require("../controllers/registerController");
const { handleCheckInOut } = require("../controllers/checkInOutController");

const router = express.Router();

router.post("/register", handleRegistration);
router.post("/check-in", (req, res) => handleCheckInOut(req, res, "check-in"));
router.post("/check-out", (req, res) => handleCheckInOut(req, res, "check-out"));

module.exports = { apiRoutes: router };
