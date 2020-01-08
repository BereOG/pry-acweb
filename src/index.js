const express = require("express");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const { database } = require("./keys");
const passport = require("passport");

// Initializations
const app = express();
require("./lib/passport");

// Settings
app.set("port", process.env.PORT || 8080);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    helpers: require("./lib/handlebars")
  })
);
app.set("view engine", ".hbs");

// Middleware
app.use(
  session({
    secret: "faztmysqlnodemysql",
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
  })
);
app.use(flash());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
  res.locals.message = req.flash("message");
  res.locals.success = req.flash("success");
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require("./routes"));
app.use(require("./routes/authentication"));
app.use("/admin", require("./routes/admin"));

// Public
app.use(express.static(path.join(__dirname, "public")));
// Starting the server
app.listen(app.get("port"), () => {
  console.log("Server on port", app.get("port"));
});
