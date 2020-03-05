function hbsHelpers(hbs) {
  return hbs.registerHelper("ifeq", function(a, b) {
    if (a == b) {
      return true;
    }
    return false;
  });
}

module.exports = hbsHelpers;
