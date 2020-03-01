const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../lib/auth");

// Connection DB
const pool = require("../database");

const fs = require("fs");

router.get("/add", isLoggedIn, (req, res) => {
  res.render("employees/emp");
});

router.get("/", isLoggedIn, (req, res) => {
  res.render("employees/emp");
});

module.exports = router;
