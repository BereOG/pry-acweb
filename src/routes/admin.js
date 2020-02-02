const express = require("express");
const router = express.Router();

// Connection DB
const pool = require("../database");

router.get("/add", (req, res) => {
  res.render("admin/add");
});

router.post("/add", (req, res) => {
  res.send("received");
});

module.exports = router;
