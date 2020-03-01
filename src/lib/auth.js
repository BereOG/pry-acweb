module.exports = {
  isLoggedIn(req, res, next) {
    console.log(req.session.user);
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect("/signin");
  },

  isAdmin(req, res, next) {
    console.log(req.session.user);
    if (req.isAuthenticated()) {
      if (req.session.user.Tipo_Usuario === "Administrador") {
        return res.redirect("/admin/add");
      }
      return next();
    }
  }
};
