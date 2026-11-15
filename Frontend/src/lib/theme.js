const THEME_KEY = "voybus.theme"
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

const resolve = (mode) => {
    if (mode === "system") return mediaQuery.matches ? "dark" : "light"
    return mode === "dark" ? "dark" : "light"
}

const paint = (mode) => {
    document.documentElement.dataset.theme = resolve(mode)
}

export const storedTheme = () => window.localStorage.getItem(THEME_KEY) || "system"

export const applyTheme = (mode = storedTheme()) => {
    window.localStorage.setItem(THEME_KEY, mode)
    paint(mode)
}

export const watchSystemTheme = () => {
    mediaQuery.addEventListener("change", () => {
        if (storedTheme() === "system") paint("system")
    })
}
