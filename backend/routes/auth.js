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

  res.json({ 
    mensaje: "Inicio de sesión exitoso", 
    usuario: {
      id: user.rows[0].id,
      nombre: user.rows[0].nombre,
      email: user.rows[0].email,
      nombre_empresa: user.rows[0].nombre_empresa,
      sector: user.rows[0].sector,
      ingresos: user.rows[0].ingresos,
      gastos: user.rows[0].gastos,
      deudas: user.rows[0].deudas,
      objetivo: user.rows[0].objetivo
    }
  });
});

// Ruta para guardar recomendaciones
router.post("/save-recommendation", async (req, res) => {
  try {
    const { usuario_id, opcion_recomendada, puntuacion, datos } = req.body;
    
    const query = `
      INSERT INTO recomendaciones
      (usuario_id, opcion_recomendada, puntuacion, datos, fecha_creacion)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    
    await pool.query(query, [usuario_id, opcion_recomendada, puntuacion, JSON.stringify(datos)]);
    res.json({ mensaje: "Recomendación guardada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la recomendación" });
  }
});

// Ruta para obtener recomendaciones del usuario
router.get("/recommendations/:usuario_id", async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    const query = `
      SELECT * FROM recomendaciones 
      WHERE usuario_id = $1 
      ORDER BY fecha_creacion DESC
    `;
    
    const result = await pool.query(query, [usuario_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las recomendaciones" });
  }
});

// Ruta para obtener perfil del usuario
router.get("/profile/:usuario_id", async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    const query = "SELECT * FROM emprendedores WHERE id = $1";
    const result = await pool.query(query, [usuario_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
});

export default router;
