import { StyleSheet, View } from "react-native"
import { AppText } from "./AppText"
import LogoMark from "../../assets/logo.svg"

// El logo se dibuja desde assets/logo.svg, así se ve nítido en cualquier tamaño.
// Los íconos de la app (PNG) se generan desde el mismo archivo con "npm run icons".
export function Logo({ size = 40, showName = true }) {
    return (
        <View style={styles.row} accessibilityRole="image" accessibilityLabel="VoyBus">
            <LogoMark width={size} height={size} />
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
