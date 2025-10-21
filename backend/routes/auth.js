import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, nombreEmpresa, sector, ingresos, gastos, deudas, objetivo } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO emprendedores
      (nombre, email, password, nombre_empresa, sector, ingresos, gastos, deudas, objetivo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;
    await pool.query(query, [nombre, email, hashedPassword, nombreEmpresa, sector, ingresos, gastos, deudas, objetivo]);
    res.json({ mensaje: "Registro exitoso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query("SELECT * FROM emprendedores WHERE email = $1", [email]);
  if (user.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

  res.json({ mensaje: "Inicio de sesión exitoso", usuario: user.rows[0].nombre });
});

export default router;
