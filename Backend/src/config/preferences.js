// Catálogo único de preferencias de cuenta (ACC-06).
// Se usa para definir el modelo, validar las solicitudes y explicar cada opción en la app.
// Los valores por defecto son los más seguros: no se comparte actividad ni se muestra contenido explícito.

const preferenceGroups = {
    general: {
        label: "General",
        description: "Ajustes de idioma y apariencia de la aplicación."
    },
    notifications: {
        label: "Notificaciones",
        description: "Elige qué avisos quieres recibir dentro de la aplicación."
    },
    privacy: {
        label: "Privacidad",
        description: "Controla qué información de tu cuenta se comparte."
    }
}

const preferenceDefinitions = [
    {
        key: "language",
        group: "general",
        column: "language",
        type: "enum",
        defaultValue: "es",
        label: "Idioma",
        description: "Idioma en que se muestran los textos de la aplicación.",
        options: [
            { value: "es", label: "Español" },
            { value: "en", label: "English" }
        ]
    },
    {
        key: "theme",
        group: "general",
        column: "theme",
        type: "enum",
        defaultValue: "system",
        label: "Tema",
        description: "Apariencia de la aplicación. Automático sigue el ajuste del teléfono.",
        options: [
            { value: "light", label: "Claro" },
            { value: "dark", label: "Oscuro" },
            { value: "system", label: "Automático" }
        ]
    },
    {
        key: "showExplicitContent",
        group: "general",
        column: "showExplicitContent",
        type: "boolean",
        defaultValue: false,
        label: "Contenido explícito",
        description: "Muestra contenido que podría no ser apto para todo público."
    },
    {
        key: "nextStop",
        group: "notifications",
        column: "notifyNextStop",
        type: "boolean",
        defaultValue: true,
        label: "Tu paradero es el siguiente",
        description: "Te avisa cuando el vehículo se acerca a tu paradero de destino."
    },
    {
        key: "tripEndedEarly",
        group: "notifications",
        column: "notifyTripEndedEarly",
        type: "boolean",
        defaultValue: true,
        label: "Viaje finalizado antes de tu destino",
        description: "Te avisa si el viaje termina antes de llegar a tu paradero."
    },
    {
        key: "routeIncident",
        group: "notifications",
        column: "notifyRouteIncident",
        type: "boolean",
        defaultValue: true,
        label: "Incidencias en tu recorrido",
        description: "Te avisa cuando una incidencia afecta el recorrido en que viajas."
    },
    {
        key: "favoriteLineSuspended",
        group: "notifications",
        column: "notifyFavoriteLineSuspended",
        type: "boolean",
        defaultValue: true,
        label: "Suspensión de líneas favoritas",
        description: "Te avisa cuando una de tus líneas favoritas se suspende."
    },
    {
        key: "showRecentActivity",
        group: "privacy",
        column: "showRecentActivity",
        type: "boolean",
        defaultValue: false,
        label: "Mostrar actividad reciente",
        description: "Permite que tu actividad reciente sea visible. Está desactivado salvo que lo habilites."
    }
]

// Ruta del campo en el cuerpo de la solicitud y en la respuesta.
// Los ajustes generales van en la raíz; el resto, dentro de su grupo (p. ej. notifications.nextStop).
const preferencePath = (definition) =>
    definition.group === "general" ? definition.key : `${definition.group}.${definition.key}`

module.exports = {
    preferenceGroups,
    preferenceDefinitions,
    preferencePath
}
