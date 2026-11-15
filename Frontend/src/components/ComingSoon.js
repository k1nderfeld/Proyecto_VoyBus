import { StyleSheet, View } from "react-native"
import { AppText } from "./AppText"
import { EmptyState } from "./States"
import { Screen } from "./Screen"

// Pantalla provisoria para las secciones que se completan en las siguientes ramas.
export function ComingSoon({ title, icon, description }) {
    return (
        <Screen>
            <View style={styles.header}>
                <AppText variant="title" accessibilityRole="header">
                    {title}
                </AppText>
            </View>
            <EmptyState icon={icon} title="Disponible pronto" description={description} />
        </Screen>
    )
}

const styles = StyleSheet.create({
    header: {
        gap: 4
    }
})
