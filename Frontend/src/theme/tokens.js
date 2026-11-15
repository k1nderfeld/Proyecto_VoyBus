// Paleta oficial del informe de la primera entrega (sección 1.3 "Lineamientos visuales").
export const palette = {
    purple: "#6C3BFF",
    purpleLight: "#9B6DFF",
    blue: "#2455E6",
    navy: "#111A5C",
    white: "#FFFFFF"
}

// Colores por tema. Los componentes usan estos nombres y nunca un color fijo,
// así el tema claro u oscuro (ACC-06) se aplica en toda la app.
const light = {
    primary: palette.purple,
    primaryStrong: "#5A2BEB",
    primarySoft: "#EEE8FF",
    primaryLight: palette.purpleLight,
    accent: palette.blue,
    accentSoft: "#E6EDFD",
    navy: palette.navy,
    onPrimary: palette.white,
    background: "#F6F6FD",
    surface: palette.white,
    surfaceAlt: "#EEEFFA",
    text: "#15162B",
    textSoft: "#353A55",
    muted: "#6F7489",
    border: "#E3E3F1",
    borderStrong: "#D2D3E6",
    success: "#14805F",
    successSoft: "#E5F7F0",
    warning: "#A86209",
    warningSoft: "#FDF2DF",
    danger: "#C52B49",
    dangerSoft: "#FDECEF",
    scrim: "rgba(17, 26, 92, 0.45)",
    shadow: "#111A5C"
}

const dark = {
    primary: palette.purpleLight,
    primaryStrong: palette.purple,
    primarySoft: "#241F55",
    primaryLight: "#B79BFF",
    accent: "#5D8BFF",
    accentSoft: "#16255A",
    navy: "#DCE1FF",
    onPrimary: palette.white,
    background: "#090D2B",
    surface: "#121842",
    surfaceAlt: "#1A2152",
    text: "#F2F3FF",
    textSoft: "#D4D7EA",
    muted: "#A3A9C9",
    border: "#252D5E",
    borderStrong: "#333C75",
    success: "#48D3A2",
    successSoft: "#123A30",
    warning: "#F4B95C",
    warningSoft: "#3B2C14",
    danger: "#FF8598",
    dangerSoft: "#3C1A25",
    scrim: "rgba(3, 5, 20, 0.7)",
    shadow: "#000000"
}

export const colorSchemes = { light, dark }

// Plus Jakarta Sans, la misma fuente de la versión web.
export const fonts = {
    regular: "PlusJakartaSans_400Regular",
    medium: "PlusJakartaSans_500Medium",
    semibold: "PlusJakartaSans_600SemiBold",
    bold: "PlusJakartaSans_700Bold",
    extrabold: "PlusJakartaSans_800ExtraBold"
}

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
}

export const radius = {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999
}
