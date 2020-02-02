const express = require("express");
const router = express.Router();

const helpers = require("./../lib/helpers");

// Connection DB
const pool = require("../database");

router.get("/signup", (req, res) => {
  res.render("auth/signup");
});

router.get("/", async (req, res) => {
  const query =
    "SELECT empleado.IdEmp, empleado.idUs, empleado.Nombre, empleado.`Apellido P`, empleado.`Apellido M`, usuarios.Username, usuarios.Correo FROM empleado INNER JOIN usuarios ON usuarios.IdUsu = empleado.idUs ";
  // const empleado = (await pool.query("SELECT * FROM empleado ")).map(emp => {
  const empleado = (await pool.query(query)).map(emp => {
    const empleado = emp;
    empleado.apellidoP = empleado["Apellido P"];
    empleado.apellidoM = empleado["Apellido M"];
    delete empleado["Apellido P"];
    delete empleado["Apellido M"];
    console.log({ empleado });
    return empleado;
  });
  console.log(empleado);
  res.render("admin/lista", { empleado });
});

router.get("/delete/:id", async (req, res) => {
  const { id } = req.params;
  //console.log({ IdEmp });
  const del = await pool.query("DELETE FROM empleado WHERE IdEmp = ?", [id]);
  console.log({ del });
  res.redirect("/empleado");
});

router.post("/", async (req, res) => {
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
    Username,
    Password,
    Correo,
    Tipo_Usuario
  };

  const val = await pool.query(
    `SELECT * FROM usuarios WHERE Correo = '${Correo}' limit 1 `
  );

  if (val[0]) {
    return done(null, null);
  }
  newUser.Password = await helpers.encryptPassword(Password);
  const result = await pool.query("INSERT INTO usuarios SET ? ", [newUser]);

  const comp = {
    IdEmp,
    Nombre,
    "Apellido P": ApellidoP,
    "Apellido M": ApellidoM,
    idUs: result.insertId
  };
  await pool.query("INSERT INTO empleado SET ?", [comp]);

  res.redirect("/empleado");
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { IdEmp, Nombre, ApellidoP, ApellidoM, Username, Correo } = req.body;
  console.log({ id });
  const query_1 =
    "UPDATE `empleado` SET `IdEmp`= ?,`Nombre`= ?,`Apellido P`= ?,`Apellido M`= ? WHERE (`IdEmp`=?)";
  const params_1 = [IdEmp, Nombre, ApellidoP, ApellidoM, id];
  const update_1 = await pool.query(query_1, params_1);
  const query_2 = "UPDATE `usuarios` SET `Username`=?,`Correo`=? WHERE ?";
  const params_2 = [Username, Correo, id];
  const update_2 = await pool.query(query_2, params_2);
  // const edit = await pool.query("SELECT * FROM empleado WHERE IdEmp = ?", [id]);
  // console.log({ edit });
  res.redirect("/empleado");
});

module.exports = router;
