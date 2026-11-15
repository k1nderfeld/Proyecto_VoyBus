import { Text } from "react-native"
import { useTheme } from "../context/ThemeContext"

// Estilos de texto de la app. Usar siempre AppText para respetar la fuente y el tema.
const variants = {
    display: { fontSize: 30, lineHeight: 36, weight: "extrabold" },
    title: { fontSize: 24, lineHeight: 30, weight: "bold" },
    subtitle: { fontSize: 18, lineHeight: 24, weight: "bold" },
    body: { fontSize: 15, lineHeight: 22, weight: "regular" },
    label: { fontSize: 14, lineHeight: 20, weight: "semibold" },
    caption: { fontSize: 13, lineHeight: 18, weight: "regular" },
    overline: { fontSize: 11.5, lineHeight: 16, weight: "bold", letterSpacing: 1, uppercase: true }
}

const tones = {
    default: "text",
    soft: "textSoft",
    muted: "muted",
    primary: "primary",
    danger: "danger",
    success: "success",
    warning: "warning",
    inverse: "onPrimary"
}

export function AppText({ variant = "body", tone = "default", weight, align, style, children, ...props }) {
    const { colors, fonts } = useTheme()
    const config = variants[variant] ?? variants.body

    return (
        <Text
            {...props}
            style={[
                {
                    color: colors[tones[tone] ?? tone] ?? colors.text,
                    fontFamily: fonts[weight ?? config.weight],
                    fontSize: config.fontSize,
                    lineHeight: config.lineHeight,
                    letterSpacing: config.letterSpacing,
                    textTransform: config.uppercase ? "uppercase" : undefined,
                    textAlign: align
                },
                style
            ]}
        >
            {children}
        </Text>
    )
}
