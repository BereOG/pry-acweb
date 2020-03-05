const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../lib/auth");

// Connection DB
const pool = require("../database");

const fs = require("fs");

router.get("/add", isLoggedIn, (req, res) => {
  res.render("employees/emp");
});

router.post("/add-ins", isLoggedIn, async (req, res) => {
  console.log(req.body);
  const r = await pool.query("INSERT INTO detalle_insidencia SET ? ", [
    req.body
  ]);
  console.log(r);
  res.redirect("/empleado/insidencias");
});

router.get("/", isLoggedIn, (req, res) => {
  console.log(":v");
  res.render("employees/emp");
});

router.get("/insidencias", (req, res) => {
  res.render("employees/insidencias");
});

module.exports = router;
