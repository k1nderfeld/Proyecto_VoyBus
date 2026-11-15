import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

export function Checkbox({ checked, onChange, label, error }) {
    const { colors } = useTheme()

    return (
        <View style={styles.wrapper}>
            <Pressable
                onPress={() => onChange(!checked)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                style={styles.row}
                hitSlop={6}
            >
                <View
                    style={[
                        styles.box,
                        {
                            borderColor: error ? colors.danger : checked ? colors.primary : colors.borderStrong,
                            backgroundColor: checked ? colors.primary : colors.surface
                        }
                    ]}
                >
                    {checked && <Ionicons name="checkmark" size={15} color={colors.onPrimary} />}
                </View>
                <AppText variant="caption" tone="soft" style={styles.label}>
                    {label}
                </AppText>
            </Pressable>
            {error && (
                <AppText variant="caption" tone="danger">
                    {error}
                </AppText>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 6
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    box: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center"
    },
    label: {
        flex: 1
    }
})
