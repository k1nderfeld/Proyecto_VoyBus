import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

// En el teléfono se usa el almacenamiento seguro del sistema (RNF-03).
// La versión web solo se usa para desarrollo, y ahí no existe SecureStore.
const isWeb = Platform.OS === "web"

export const storage = {
    async get(key) {
        try {
            return isWeb ? window.localStorage.getItem(key) : await SecureStore.getItemAsync(key)
        } catch {
            return null
        }
    },

    async set(key, value) {
        try {
            if (isWeb) window.localStorage.setItem(key, value)
            else await SecureStore.setItemAsync(key, value)
        } catch {
            // Si el almacenamiento falla, la app sigue funcionando durante la sesión actual.
        }
    },

    async remove(key) {
        try {
            if (isWeb) window.localStorage.removeItem(key)
            else await SecureStore.deleteItemAsync(key)
        } catch {
            // Igual que en set: no se interrumpe el uso de la app.
        }
    }
}
