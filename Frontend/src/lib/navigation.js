// Ruta a la que volver después de iniciar sesión. Solo se aceptan rutas internas de la app.
export const safeNext = (value) => {
    const next = Array.isArray(value) ? value[0] : value
    return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/"
}

// Acepta el enlace completo del correo o solo el código, y devuelve el token de 64 caracteres.
export const extractToken = (value) => value?.match(/[a-f0-9]{64}/i)?.[0]?.toLowerCase() ?? null
