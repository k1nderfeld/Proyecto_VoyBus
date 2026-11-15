import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import { FavoritesProvider } from "./context/FavoritesContext"
import { ToastProvider } from "./context/ToastContext"
import { applyTheme, watchSystemTheme } from "./lib/theme"
import "./styles.css"

applyTheme()
watchSystemTheme()

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <FavoritesProvider>
                        <App />
                    </FavoritesProvider>
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    </StrictMode>
)
