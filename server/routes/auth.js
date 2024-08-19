const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el nombre de usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario ya está en uso" });
    }

    // Crear el usuario
    const user = await User.create({
      username,
      email,
      password: password,
    });

    // Generar token
    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(400).json({ error: error.message });
  }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Usuario no encontrado");
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Añadir logs para depuración
    console.log("Contraseña ingresada:", password);
    console.log("Contraseña almacenada (hasheada):", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Resultado de la comparación:", isMatch);

    if (!isMatch) {
      console.log("Contraseña incorrecta");
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Error en el proceso de inicio de sesión:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Ruta protegida para obtener el perfil del usuario actual
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // Excluir la contraseña en la respuesta
    res.json(user);
  } catch (error) {
    console.error("Error al verificar el token:", error);
    res.status(401).json({ error: "Token no válido" });
  }
});

module.exports = router;
