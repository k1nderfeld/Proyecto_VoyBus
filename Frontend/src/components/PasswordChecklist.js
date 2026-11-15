import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

// items: [{ label, met }]. Muestra en vivo qué requisitos cumple la contraseña.
export function PasswordChecklist({ items }) {
    const { colors } = useTheme()

    return (
        <View style={styles.list} accessibilityLabel="Requisitos de la contraseña">
            {items.map((item) => (
                <View key={item.label} style={styles.item}>
                    <Ionicons
                        name={item.met ? "checkmark-circle" : "ellipse-outline"}
                        size={16}
                        color={item.met ? colors.success : colors.muted}
                    />
                    <AppText variant="caption" tone={item.met ? "success" : "muted"}>
                        {item.label}
                    </AppText>
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    list: {
        gap: 4
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    }
})
