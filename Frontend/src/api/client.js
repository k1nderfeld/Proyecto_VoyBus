const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/+$/, "")
const API_ORIGIN = new URL(API_URL, window.location.origin).origin
const TOKEN_KEY = "voybus.token"

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.data = data
    }
}

export const session = {
    get: () => window.localStorage.getItem(TOKEN_KEY),
    set: (token) => window.localStorage.setItem(TOKEN_KEY, token),
    clear: () => window.localStorage.removeItem(TOKEN_KEY)
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

const request = async (path, { method = "GET", body, form, auth = true, signal } = {}) => {
    const headers = {}

    if (body !== undefined && !form) headers["Content-Type"] = "application/json"

    const token = session.get()

    if (auth && token) headers.Authorization = `Bearer ${token}`

    let response

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: form ? body : body !== undefined ? JSON.stringify(body) : undefined,
            signal
        })
    } catch (error) {
        if (error.name === "AbortError") throw error
        throw new ApiError("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.", 0, null)
    }

    const data = await parseBody(response)

    if (!response.ok) {
        if (response.status === 401 && auth && session.get()) {
            window.dispatchEvent(new Event("voybus:session-expired"))
        }

        throw new ApiError(
            data?.message || "No se pudo completar la solicitud.",
            response.status,
            data
        )
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
    const search = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            search.set(key, String(value))
        }
    })

    const result = search.toString()
    return result ? `?${result}` : ""
}

export const assetUrl = (value) => {
    if (!value) return null
    if (/^(https?:|data:|blob:)/.test(value)) return value
    return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`
}
