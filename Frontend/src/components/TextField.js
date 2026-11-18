import { forwardRef, useState } from "react"
import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

// Campo de formulario con etiqueta, ayuda y error. Con secure=true agrega el botón para mostrar la contraseña.
export const TextField = forwardRef(function TextField(
    { label, error, hint, icon, secure = false, style, editable = true, ...inputProps },
    ref
) {
    const { colors, fonts, radius } = useTheme()
    const [focused, setFocused] = useState(false)
    const [visible, setVisible] = useState(false)

    const borderColor = error ? colors.danger : focused ? colors.primary : colors.border

    return (
        <View style={[styles.field, style]}>
            {label && (
                <AppText variant="label" tone="soft">
                    {label}
                </AppText>
            )}
            <View
                style={[
                    styles.inputRow,
                    {
                        borderColor,
                        borderRadius: radius.md,
                        backgroundColor: editable ? colors.surface : colors.surfaceAlt
                    }
                ]}
            >
                {icon && <Ionicons name={icon} size={19} color={focused ? colors.primary : colors.muted} />}
                <TextInput
                    ref={ref}
                    {...inputProps}
                    editable={editable}
                    secureTextEntry={secure && !visible}
                    placeholderTextColor={colors.muted}
                    accessibilityLabel={inputProps.accessibilityLabel ?? label}
                    onFocus={(event) => {
                        setFocused(true)
                        inputProps.onFocus?.(event)
                    }}
                    onBlur={(event) => {
                        setFocused(false)
                        inputProps.onBlur?.(event)
                    }}
                    style={[styles.input, { color: colors.text, fontFamily: fonts.regular }]}
                />
                {secure && (
                    <Pressable
                        onPress={() => setVisible((current) => !current)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
                    </Pressable>
                )}
            </View>
            {error ? (
                <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
                    {error}
                </AppText>
            ) : hint ? (
                <AppText variant="caption" tone="muted">
                    {hint}
                </AppText>
            ) : null}
        </View>
    )
})

const styles = StyleSheet.create({
    field: {
        gap: 6
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        minHeight: 52
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 12
    }
})
