import { Image, StyleSheet, View } from "react-native"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"
import { assetUrl } from "../api/client"
import { initials } from "../lib/format"

// Foto de perfil o, si no hay, las iniciales del nombre. uri permite mostrar una foto aún no guardada (vista previa).
export function Avatar({ user, uri, size = 64 }) {
    const { colors } = useTheme()
    const source = uri ?? assetUrl(user?.photoUrl)
    const shape = { width: size, height: size, borderRadius: size / 2 }

    if (source) {
        return <Image source={{ uri: source }} style={shape} accessibilityLabel="Foto de perfil" />
    }

    return (
        <View style={[styles.initials, shape, { backgroundColor: colors.primary }]} accessibilityLabel="Sin foto de perfil">
            <AppText variant={size >= 80 ? "title" : "subtitle"} tone="inverse">
                {initials(user?.name)}
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    initials: {
        alignItems: "center",
        justifyContent: "center"
    }
})
