const express = require("express");
const router = express.Router();
const passport = require("passport");

const { isLoggedIn } = require("../lib/auth");

router.get("/signup", (req, res) => {
  res.render("auth/signup");
});

router.post(
  "/signup",
  passport.authenticate("local.signup", {
    successRedirect: "/empleado",
    failureRedirect: "/signup",
    failureFlash: true
  })
);

router.post(
  "/signup-admin",
  passport.authenticate("local.signup", {
    successRedirect: "/admin/add",
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
  res.status(200).json({ user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut();
  req.session.user = null;
  res.redirect("/signin");
});

module.exports = router;
