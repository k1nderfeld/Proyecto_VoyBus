import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { api, session } from "../api/client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        let active = true

        const load = async () => {
            if (!session.get()) {
                setReady(true)
                return
            }

            try {
                const response = await api.get("/users/me")
                if (active) setUser(response.data)
            } catch {
                session.clear()
                if (active) setUser(null)
            } finally {
                if (active) setReady(true)
            }
        }

        load()

        const expire = () => {
            session.clear()
            setUser(null)
        }

        window.addEventListener("voybus:session-expired", expire)

        return () => {
            active = false
            window.removeEventListener("voybus:session-expired", expire)
        }
    }, [])

    const login = useCallback(async (credentials) => {
        const response = await api.post("/auth/login", credentials, { auth: false })
        session.set(response.data.token)
        setUser(response.data.user)
        return response
    }, [])

    const register = useCallback(
        async (payload) => {
            await api.post("/auth/register", payload, { auth: false })

            return login({
                email: payload.email,
                phone: payload.phone || undefined,
                password: payload.password
            })
        },
        [login]
    )

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout")
        } catch {
            session.clear()
        }
        session.clear()
        setUser(null)
    }, [])

    const refresh = useCallback(async () => {
        const response = await api.get("/users/me")
        setUser(response.data)
        return response.data
    }, [])

    const value = useMemo(
        () => ({ user, ready, login, register, logout, refresh, updateUser: setUser }),
        [user, ready, login, register, logout, refresh]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
