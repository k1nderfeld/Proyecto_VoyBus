import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { Icon } from "../components/Icon"

const ToastContext = createContext(null)
let nextId = 0

const toneIcons = {
    success: "check",
    error: "alert",
    info: "info"
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const timers = useRef(new Map())

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
        const timer = timers.current.get(id)
        if (timer) window.clearTimeout(timer)
        timers.current.delete(id)
    }, [])

    const push = useCallback(
        (message, tone = "success") => {
            const id = ++nextId
            setToasts((current) => [...current.slice(-2), { id, message, tone }])
            timers.current.set(id, window.setTimeout(() => dismiss(id), 4200))
        },
        [dismiss]
    )

    const value = useMemo(
        () => ({
            push,
            success: (message) => push(message, "success"),
            error: (message) => push(message, "error"),
            info: (message) => push(message, "info")
        }),
        [push]
    )

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-stack" role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.tone}`}>
                        <span className="toast-icon">
                            <Icon name={toneIcons[toast.tone]} size={18} />
                        </span>
                        <p>{toast.message}</p>
                        <button type="button" className="toast-close" onClick={() => dismiss(toast.id)} aria-label="Cerrar aviso">
                            <Icon name="close" size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => useContext(ToastContext)
