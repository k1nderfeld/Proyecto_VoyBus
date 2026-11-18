import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

export function SearchBar({ value, onChangeText, placeholder, accessibilityLabel }) {
    const { colors, fonts, radius } = useTheme()

    return (
        <View
            accessibilityRole="search"
            style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}
        >
            <Ionicons name="search" size={19} color={colors.muted} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                accessibilityLabel={accessibilityLabel ?? placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                maxLength={50}
                style={[styles.input, { color: colors.text, fontFamily: fonts.regular }]}
            />
            {value ? (
                <Pressable
                    onPress={() => onChangeText("")}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Borrar búsqueda"
                >
                    <Ionicons name="close-circle" size={19} color={colors.muted} />
                </Pressable>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
        minHeight: 50
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 10
    }
})
