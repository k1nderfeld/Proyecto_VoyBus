import { StyleSheet, View } from "react-native"
import { AppText } from "./AppText"

// Elige texto blanco u oscuro según qué tan claro sea el color de la línea, para mantener el contraste (RNF-07).
const textColorFor = (hex) => {
    const value = /^#([0-9a-f]{6})$/i.exec(hex ?? "")?.[1]
    if (!value) return "#FFFFFF"

    const [r, g, b] = [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16) / 255)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.6 ? "#111A5C" : "#FFFFFF"
}

// Código de la línea sobre su color identificador.
export function LineBadge({ code, color, size = "md" }) {
    const large = size === "lg"
    const small = size === "sm"

    return (
        <View
            accessibilityLabel={`Línea ${code}`}
            style={[
                styles.badge,
                {
                    backgroundColor: color,
                    minWidth: large ? 60 : small ? 38 : 48,
                    height: large ? 44 : small ? 24 : 34,
                    borderRadius: large ? 14 : small ? 7 : 10,
                    paddingHorizontal: small ? 6 : 10
                }
            ]}
        >
            <AppText
                variant={large ? "subtitle" : small ? "caption" : "label"}
                weight="extrabold"
                style={{ color: textColorFor(color) }}
            >
                {code}
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        alignItems: "center",
        justifyContent: "center"
    }
})
