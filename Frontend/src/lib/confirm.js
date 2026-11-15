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
