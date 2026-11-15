import { StyleSheet, View } from "react-native"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"

const tones = {
    primary: ["primarySoft", "primary"],
    success: ["successSoft", "success"],
    warning: ["warningSoft", "warning"],
    danger: ["dangerSoft", "danger"],
    neutral: ["surfaceAlt", "muted"]
}

export function Badge({ label, tone = "primary" }) {
    const { colors, radius } = useTheme()
    const [background, color] = tones[tone] ?? tones.primary

    return (
        <View style={[styles.badge, { backgroundColor: colors[background], borderRadius: radius.pill }]}>
            <AppText variant="caption" weight="semibold" style={{ color: colors[color] }}>
                {label}
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 3
    }
})
