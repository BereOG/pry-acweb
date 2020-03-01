const express = require("express");
const router = express.Router();

const helpers = require("./../lib/helpers");
const { isLoggedIn } = require("../lib/auth");

// Connection DB
const pool = require("../database");

const fs = require("fs");

router.get("/add", isLoggedIn, (req, res) => {
  res.render("admin/add");
});

router.get("/students", isLoggedIn, async (req, res) => {
  const students = await pool.query("SELECT * FROM alumno");

  //Convertimos a string. Luego a JSON
  var strQueryStudents = JSON.stringify(students);
  var jsonGroupStudents = JSON.parse(strQueryStudents);

  console.log("##### JSON ALUMNOS: ", jsonGroupStudents);

  for (var i = 0; i < jsonGroupStudents.length; i++) {
    var tmpGroup = jsonGroupStudents[i]["Grupo"];
    console.log("##### VARIABLE DE GRUPO ID: ", tmpGroup);

    var tmpNameGroup = await pool.query(
      "SELECT NOM_GRUPO FROM grupos WHERE ID_GRUPO = ?",
      [tmpGroup]
    );
    console.log("##### QUERY PARA NOMBRE DE GRUPO: ", tmpNameGroup);

    var strQueryNomGroup = JSON.stringify(tmpNameGroup);
    var jsonNameGoup = JSON.parse(strQueryNomGroup);

    console.log("##### JSON DE NOMBRE: ", jsonNameGoup);
    jsonGroupStudents[i]["Grupo"] = jsonNameGoup[0]["NOM_GRUPO"];

    var tmpTurn = jsonGroupStudents[i]["Turno"];
    if (tmpTurn == 1) {
      jsonGroupStudents[i]["Turno"] = "Matutino";
    }
    if (tmpTurn == 2) {
      jsonGroupStudents[i]["Turno"] = "Vespertino";
    }

    console.log("##### json FINAL: ", jsonGroupStudents);
  }

  res.render("admin/students", { jsonGroupStudents });
});

router.get("/generate-pdf", async (req, res) => {
  const data = req.body;
  console.log("DATA:::::::", data);
});

router.post("/cargaArchivos", async (req, res) => {
  const rutaArchivo = req.body.rutaArchivo;
  console.log("##### RUTA DE ARCHIVO: " + rutaArchivo);

  fs.readFile(rutaArchivo, "utf-8", async (err, data) => {
    if (err) {
      console.log("error: ", err);
    } else {
      //Contenido de archivo
      var content = data;

      var cont = 0;
      var contExitos = 0;
      var contErrores = 0;
      var nombre = undefined;
      var apellido_p = undefined;
      var apellido_m = undefined;
      var matricula = undefined;
      var grupo = undefined;
      var turno = undefined;
      var carrera = undefined;
      var grupoNom = undefined;

      var lines = content.toString().split("\n");

      console.log("##### CONTENIDO DE ARCHIVO: " + content);
      console.log("##### CONTENIDO SEPARADO POR LINEAS: ", lines);

      for (i in lines) {
        //
        if (cont != 0) {
          const newStudentArr = lines[i].split("|");
          matricula = newStudentArr[0];
          nombre = newStudentArr[1];
          apellido_p = newStudentArr[2];
          apellido_m = newStudentArr[3];
          carrera = newStudentArr[4];
          grupoNom = newStudentArr[5];
          turno = newStudentArr[6];

          console.log("###### TURNO VALOR: ", turno);
          if (turno.localeCompare("Matutino")) {
            turno = 1;
          } else if (turno.localeCompare("Vespertino")) {
            turno = 2;
          } else {
            turno = null;
          }

          const queryGroup = await pool.query(
            "SELECT * FROM grupos WHERE NOM_GRUPO = ?",
            [grupoNom]
          );

          var strQueryGroup = JSON.stringify(queryGroup);
          var jsonGroup = JSON.parse(strQueryGroup);

          if (Object.keys(jsonGroup).length < 1) {
            contErrores++;
          } else {
            grupo = jsonGroup[0].ID_GRUPO;
            const newStudent = {
              matricula,
              nombre,
              apellido_p,
              apellido_m,
              carrera,
              grupo,
              turno
            };

            console.log("###### ALUMNO PARA AGREGAR: ", newStudent);
            await pool.query("INSERT INTO alumno set ?", [newStudent]);
            contExitos++;
          }

          cont++;
        } else {
          cont++;
        }
      }
    }
  });

  setTimeout(res.redirect("/admin/students"), 10000);
});

router.post("/add", async (req, res) => {
  const {
    nombre,
    apellido_p,
    apellido_m,
    matricula,
    grupo,
    turno,
    carrera
  } = req.body;
  const newStudent = {
    matricula,
    nombre,
    apellido_p,
    apellido_m,
    carrera,
    grupo,
    turno
  };
  console.log(newStudent);

  await pool.query("INSERT INTO alumno set ?", [newStudent]);
});

router.get("/groups", isLoggedIn, async (req, res) => {
  const groups = await pool.query("SELECT * FROM grupos");
  console.log(groups);
  res.render("admin/listGroups", { groups });
});

router.get("/codeBarGenerate", async (req, res) => {
  const students = await pool.query("SELECT * FROM alumno WHERE codigo = 0");
  console.log("##### ALUMNOS SIN CODIGO DE BARRAS: ", students);
  res.render("admin/codeBarGenerate", { students });
});

router.post("/generateCodeBar", async (req, res) => {});

// ------- Empleados ------

router.get("/employees", isLoggedIn, async (req, res) => {
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
  res.redirect("/employees");
});

router.post("/addEmploye", async (req, res) => {
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

  res.redirect("/employees");
});

router.post("/editEmployee/:id", async (req, res) => {
  const { id } = req.params;
  const { IdEmp, Nombre, ApellidoP, ApellidoM, Username, Correo } = req.body;
  //console.log("ESTO QUE ES::: ", { id });
  const query_1 =
    "UPDATE `empleado` SET `IdEmp`= ?,`Nombre`= ?,`Apellido P`= ?,`Apellido M`= ? WHERE (`IdEmp`=?)";
  const params_1 = [IdEmp, Nombre, ApellidoP, ApellidoM, id];
  const update_1 = await pool.query(query_1, params_1);
  const query_2 = "UPDATE `usuarios` SET `Username`=?,`Correo`=? WHERE ?";
  const params_2 = [Username, Correo, id];
  const update_2 = await pool.query(query_2, params_2);
  // const edit = await pool.query("SELECT * FROM empleado WHERE IdEmp = ?", [id]);
  // console.log({ edit });
  res.redirect("/employees");
});

//--------- REPORTES -------

router.get("/reporte", isLoggedIn, async (req, res) => {
  res.render("admin/reporte");
});

module.exports = router;
