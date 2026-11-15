const { directionLabels, lineStatusLabels, lineStatusNotices, formatDays } = require("../config/network")

// Formatos públicos de la red, compartidos por las consultas de líneas (RED-01) y paraderos (RED-02).

const formatLine = (line) => ({
    id: line.id,
    code: line.code,
    name: line.name,
    color: line.color,
    status: line.status,
    statusLabel: lineStatusLabels[line.status],
    notice: lineStatusNotices[line.status] ?? null
})

const formatRoute = (route) => ({
    id: route.id,
    name: route.name,
    direction: route.direction,
    directionLabel: directionLabels[route.direction]
})

const formatStopSummary = (stop) => ({
    id: stop.id,
    code: stop.code,
    name: stop.name
})

const formatSchedules = (schedules = []) =>
    [...schedules]
        .sort((a, b) => a.dayList[0] - b.dayList[0] || a.startTime.localeCompare(b.startTime))
        .map((schedule) => ({
            days: schedule.dayList,
            daysLabel: formatDays(schedule.dayList),
            startTime: schedule.startTime,
            endTime: schedule.endTime
        }))

module.exports = {
    formatLine,
    formatRoute,
    formatStopSummary,
    formatSchedules
}
