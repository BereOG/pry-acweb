//metodos de autenticacion

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../database");
const helpers = require("./helpers");

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
      passReqToCallback: true
    },

    async (req, username, password, done) => {
      console.log(req.body);

      const rows = await pool.query(
        "SELECT * FROM usuarios WHERE Username = ?",
        [username]
      );

      if (rows.length > 0) {
        const user = rows[0];
        const validPass = await helpers.matchPassword(password, user.Password);
        if (validPass) {
          done(null, user, req.flash("success", "Bienvenido" + user.Username));
        } else {
          done(null, false, req.flash("message", "Contraseña incorrecta"));
        }
      } else {
        return done(null, false, req.flash("message", "El usuario no existe"));
      }
    }
  )
);

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
      passReqToCallback: true
    },
    async (req, username, password, done) => {
      const {
        Correo,
        Username,
        Password,
        Tipo_Usuario,
        IdEmp,
        Nombre,
        ApellidoP,
        ApellidoM
      } = req.body;

      const newUser = {
        username,
        password,
        Correo,
        Tipo_Usuario
      };
      try {
        const val = await pool.query(
          `SELECT * FROM usuarios WHERE Correo = '${Correo}' limit 1 `
        );

        if (val[0]) {
          return done(null, null);
        }

        newUser.password = await helpers.encryptPassword(password);
        const result = await pool.query("INSERT INTO usuarios SET ? ", [
          newUser
        ]);

        const comp = {
          IdEmp,
          Nombre,
          "Apellido P": ApellidoP,
          "Apellido M": ApellidoM,
          idUs: result.insertId
        };
        const compt = await pool.query("INSERT INTO empleado SET ? ", [comp]);
        newUser.id = result.insertId;
        return done(null, newUser);
      } catch (error) {
        console.log(error);
        return done(null, {});
      }
    }
  )
);

passport.serializeUser((user, done) => {
  if (user) {
    return done(null, user.id);
  }
  return;
});

passport.deserializeUser(async (id, done) => {
  console.log(id);
  const rows = await pool.query("SELECT * FROM usuarios WHERE idUsu = ?", [id]);
  console.log(rows);

  return done(null, rows[0]);
});
