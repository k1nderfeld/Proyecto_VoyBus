import { Platform } from "react-native"
import Constants from "expo-constants"
import { storage } from "../lib/storage"

const TOKEN_KEY = "voybus.token"
const API_PORT = 3000

// En Expo Go, hostUri es la IP del PC que ejecuta "npx expo start" (por ejemplo "192.168.1.10:8081").
// El backend corre en ese mismo PC, así que se usa esa IP sin tener que configurarla a mano.
const defaultApiUrl = () => {
    const devHost = Constants.expoConfig?.hostUri?.split(":")[0]

    if (Platform.OS === "web") return `http://localhost:${API_PORT}/api`
    if (devHost) return `http://${devHost}:${API_PORT}/api`
    if (Platform.OS === "android") return `http://10.0.2.2:${API_PORT}/api`
    return `http://localhost:${API_PORT}/api`
}

// EXPO_PUBLIC_API_URL (archivo .env) tiene prioridad, por ejemplo si se usa un túnel o el backend está en otro equipo.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || defaultApiUrl()).replace(/\/+$/, "")
const API_ORIGIN = API_URL.match(/^https?:\/\/[^/]+/i)?.[0] ?? ""

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.data = data
    }
}

// El token se guarda en el almacenamiento seguro y se mantiene en memoria para cada petición.
let token = null
const expiredListeners = new Set()

export const session = {
    async load() {
        token = await storage.get(TOKEN_KEY)
        return token
    },
    get: () => token,
    async set(value) {
        token = value
        await storage.set(TOKEN_KEY, value)
    },
    async clear() {
        token = null
        await storage.remove(TOKEN_KEY)
    },
    // Avisa cuando el backend rechaza el token (sesión vencida o cerrada en otro dispositivo).
    onExpired(listener) {
        expiredListeners.add(listener)
        return () => expiredListeners.delete(listener)
    }
}

const parseBody = async (response) => {
    const text = await response.text()

    if (!text) return null

    try {
        return JSON.parse(text)
    } catch {
        return { message: text }
    }
}

const REQUEST_TIMEOUT_MS = 15000

// notifyExpired=false evita el aviso "Tu sesión expiró" cuando el 401 es esperable (por ejemplo al cerrar sesión).
const request = async (path, { method = "GET", body, form = false, auth = true, signal, notifyExpired = true } = {}) => {
    const headers = { Accept: "application/json" }

    if (body !== undefined && !form) headers["Content-Type"] = "application/json"
    if (auth && token) headers.Authorization = `Bearer ${token}`

    // Si el servidor no responde, se corta la espera en vez de dejar la pantalla cargando (RNF-01).
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const abortFromCaller = () => controller.abort()
    signal?.addEventListener?.("abort", abortFromCaller)

    let response

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: form ? body : body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal
        })
    } catch (error) {
        if (signal?.aborted) throw error
        throw new ApiError(
            "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.",
            0,
            null
        )
    } finally {
        clearTimeout(timeout)
        signal?.removeEventListener?.("abort", abortFromCaller)
    }

    const data = await parseBody(response)

    if (!response.ok) {
        if (response.status === 401 && auth && token && notifyExpired) {
            expiredListeners.forEach((listener) => listener())
        }

        throw new ApiError(data?.message || "No se pudo completar la solicitud.", response.status, data)
    }

    return data
}

export const api = {
    get: (path, options) => request(path, options),
    post: (path, body, options) => request(path, { ...options, method: "POST", body }),
    patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
    put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
    delete: (path, options) => request(path, { ...options, method: "DELETE" })
}

export const queryString = (params) => {
    const parts = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)

    return parts.length ? `?${parts.join("&")}` : ""
}

// Las fotos de perfil llegan como ruta relativa ("/uploads/avatars/...") y se sirven desde el backend.
export const assetUrl = (value) => {
    if (!value) return null
    if (/^(https?:|data:|file:|blob:)/.test(value)) return value
    return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`
}
