import { StyleSheet, View } from "react-native"
import { AppText } from "./AppText"
import { Badge } from "./Badge"
import { useTheme } from "../context/ThemeContext"

// Día ISO de hoy: 1 = lunes … 7 = domingo.
const todayIso = () => ((new Date().getDay() + 6) % 7) + 1

// Días y horarios de funcionamiento de un recorrido (RED-01), marcando el horario que aplica hoy.
export function ScheduleList({ schedules }) {
    const { colors } = useTheme()
    const today = todayIso()

    if (!schedules?.length) {
        return (
            <AppText variant="caption" tone="muted">
                Este recorrido todavía no tiene horarios publicados.
            </AppText>
        )
    }

    return (
        <View>
            {schedules.map((schedule, index) => {
                const isToday = schedule.days.includes(today)

                return (
                    <View
                        key={`${schedule.daysLabel}-${schedule.startTime}`}
                        style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                    >
                        <View style={styles.days}>
                            <AppText variant="label">{schedule.daysLabel}</AppText>
                            {isToday && <Badge label="Hoy" tone="success" />}
                        </View>
                        <AppText variant="label" tone="soft">
                            {schedule.startTime} – {schedule.endTime}
                        </AppText>
                    </View>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 10
    },
    days: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 1,
        flexWrap: "wrap"
    }
})
