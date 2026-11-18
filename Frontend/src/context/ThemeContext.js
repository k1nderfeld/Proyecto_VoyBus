import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useColorScheme } from "react-native"
import { colorSchemes, fonts, radius, spacing } from "../theme/tokens"
import { storage } from "../lib/storage"

const THEME_KEY = "voybus.theme"
const MODES = ["light", "dark", "system"]

const ThemeContext = createContext(null)

// mode es la preferencia del usuario ("system" sigue el ajuste del teléfono, ACC-06).
export function ThemeProvider({ children }) {
    const systemScheme = useColorScheme()
    const [mode, setModeState] = useState("system")

    useEffect(() => {
        storage.get(THEME_KEY).then((saved) => {
            if (MODES.includes(saved)) setModeState(saved)
        })
    }, [])

    const setMode = useCallback((next) => {
        if (!MODES.includes(next)) return
        setModeState(next)
        storage.set(THEME_KEY, next)
    }, [])

    const scheme = mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode

    const value = useMemo(
        () => ({
            mode,
            setMode,
            scheme,
            isDark: scheme === "dark",
            colors: colorSchemes[scheme],
            fonts,
            spacing,
            radius
        }),
        [mode, setMode, scheme]
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
