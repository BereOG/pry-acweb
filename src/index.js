const express = require("express");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const { database } = require("./keys");
const passport = require("passport");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./tmp");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage });

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
    // helpers: require("./lib/handlebars")
    helpers: {
      ifeq: (a, b, options) => {
        if (a === b) {
          return options.fn(this);
        }
        return options.inverse(this);
      }
    }
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
  app.locals.user = req.session.user;
  next();
});

// Routes
app.use(require("./routes"));
app.use(require("./routes/authentication"));
app.use("/empleado", require("./routes/employees"));
app.use(require("./lib/auth").isLoggedIn);
app.use("/pdf", require("./pdf/routes"));
// app.use(require("./lib/auth").isAdministrador);
app.use("/admin", require("./routes/admin"));

// Public
app.use(express.static(path.join(__dirname, "public")));
// Starting the server
app.listen(app.get("port"), () => {
  console.log("Server on port", app.get("port"));
});
