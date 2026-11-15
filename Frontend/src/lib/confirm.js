import { Alert, Platform } from "react-native"

// Pide confirmación antes de una acción. Alert no funciona en la versión web, que solo se usa en desarrollo.
export const confirmAction = ({ title, message, confirmLabel = "Aceptar", destructive = false }) =>
    new Promise((resolve) => {
        if (Platform.OS === "web") {
            resolve(window.confirm(`${title}\n\n${message}`))
            return
        }

        Alert.alert(title, message, [
            { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
            { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: () => resolve(true) }
        ])
    })

// Al salir con cambios sin guardar (ACC-05): devuelve "save", "discard" o "stay".
export const askUnsavedChanges = () =>
    new Promise((resolve) => {
        if (Platform.OS === "web") {
            resolve(window.confirm("Tienes cambios sin guardar.\n\n¿Quieres descartarlos y salir?") ? "discard" : "stay")
            return
        }

        Alert.alert("Tienes cambios sin guardar", "¿Quieres guardarlos antes de salir?", [
            { text: "Seguir editando", style: "cancel", onPress: () => resolve("stay") },
            { text: "Descartar", style: "destructive", onPress: () => resolve("discard") },
            { text: "Guardar", onPress: () => resolve("save") }
        ])
    })
