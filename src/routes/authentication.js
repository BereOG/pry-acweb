const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/signup", (req, res) => {
  res.render("auth/signup");
});

router.post(
  "/signup",
  passport.authenticate("local.signup", {
    successRedirect: "/profile",
    failureRedirect: "/signup",
    failureFlash: true
  })
);

router.get("/signin", (req, res) => {
  res.render("auth/signin");
  //res.json({ message: "Contraseña incorrecta" });
});

router.get("/signin-fail", (req, res) => {
  res.json({ message: "Contraseña incorrecta", error: true });
});

router.post("/signin", (req, res, next) => {
  passport.authenticate("local.signin", {
    successRedirect: "/profile",
    failureRedirect: "/signin-fail",
    failureFlash: true
  })(req, res, next);
});

router.get("/profile", (req, res, next) => {
  res.send("this is your profile");
});

module.exports = router;
