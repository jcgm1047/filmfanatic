import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Intentar leer el rol del localStorage cuando el componente se monta
    const storedRole = localStorage.getItem("role");
    console.log("Rol recuperado del localStorage:", storedRole); // Verificación de qué valor se guarda en el localStorage
    setRole(storedRole);
  }, []); // Solo ejecutar una vez, cuando se monta el componente

  // Verificar si el token existe
  if (!localStorage.getItem("token")) {
    console.log("No hay token, redirigiendo al login...");
    return <Navigate to="/login" />;
  }

  // Verificar el rol del usuario
  if (requiredRole && role !== requiredRole) {
    console.log("Rol requerido:", requiredRole, "pero rol encontrado:", role);
    // Si se requiere un rol específico y no coincide, redirige al perfil
    return <Navigate to="/profile" />;
  }

  // Si todo está bien, renderiza el componente hijo
  return children;
};

export default PrivateRoute;
