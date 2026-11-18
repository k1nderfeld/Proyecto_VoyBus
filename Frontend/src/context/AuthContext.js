import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { api, session } from "../api/client"
import { useToast } from "./ToastContext"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const toast = useToast()
    const [user, setUser] = useState(null)
    const [ready, setReady] = useState(false)

    // Al abrir la app se recupera la sesión guardada y se valida contra el backend.
    useEffect(() => {
        let active = true

        const restore = async () => {
            const token = await session.load()

            if (!token) {
                if (active) setReady(true)
                return
            }

            try {
                const response = await api.get("/users/me")
                if (active) setUser(response.data)
            } catch (error) {
                // Sin conexión se conserva el token para reintentar después; solo se borra si el backend lo rechaza.
                if (error.status === 401) await session.clear()
            } finally {
                if (active) setReady(true)
            }
        }

        restore()

        return () => {
            active = false
        }
    }, [])

    useEffect(
        () =>
            session.onExpired(async () => {
                await session.clear()
                setUser(null)
                toast.info("Tu sesión expiró. Inicia sesión nuevamente.")
            }),
        [toast]
    )

    // Guarda la sesión que devuelven el login, la verificación de la cuenta o Google.
    const startSession = useCallback(async (sessionData) => {
        await session.set(sessionData.token)
        setUser(sessionData.user)
    }, [])

    const login = useCallback(
        async (credentials) => {
            const response = await api.post("/auth/login", credentials, { auth: false })
            await startSession(response.data)
            return response
        },
        [startSession]
    )

    // El registro público solo crea pasajeros, y la cuenta queda pendiente hasta verificar
    // el correo o el teléfono con el código que envía el backend (ACC-01).
    const register = useCallback((payload) => api.post("/auth/register", payload, { auth: false }), [])

    // Verifica el código e inicia sesión de inmediato.
    const verifyAccount = useCallback(
        async (payload) => {
            const response = await api.post("/auth/verify", payload, { auth: false })
            await startSession(response.data)
            return response
        },
        [startSession]
    )

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout", undefined, { notifyExpired: false })
        } catch {
            // Aunque el backend no responda, la sesión se cierra en el teléfono.
        }
        await session.clear()
        setUser(null)
    }, [])

    const refresh = useCallback(async () => {
        const response = await api.get("/users/me")
        setUser(response.data)
        return response.data
    }, [])

    const value = useMemo(
        () => ({
            user,
            ready,
            isPassenger: user?.role === "passenger",
            login,
            register,
            verifyAccount,
            startSession,
            logout,
            refresh,
            updateUser: setUser
        }),
        [user, ready, login, register, verifyAccount, startSession, logout, refresh]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
