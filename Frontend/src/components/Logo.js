import { Image, StyleSheet, View } from "react-native"
import { AppText } from "./AppText"

const icon = require("../../assets/icon.png")

export function Logo({ size = 40, showName = true }) {
    return (
        <View style={styles.row} accessibilityRole="image" accessibilityLabel="VoyBus">
            <Image source={icon} style={{ width: size, height: size, borderRadius: size * 0.28 }} />
            {showName && (
                <AppText variant="subtitle" weight="extrabold">
                    VoyBus
                </AppText>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    }
})
