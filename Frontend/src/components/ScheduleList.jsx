import { Icon } from "./Icon"

const isoDay = () => {
    const day = new Date().getDay()
    return day === 0 ? 7 : day
}

export function ScheduleList({ schedules = [] }) {
    if (!schedules.length) {
        return <p className="muted-text">Esta línea no tiene horarios publicados por ahora.</p>
    }

    const today = isoDay()

    return (
        <div className="schedule-list">
            {schedules.map((schedule, index) => {
                const isToday = Array.isArray(schedule.days) && schedule.days.includes(today)

                return (
                    <div className={`schedule-row ${isToday ? "is-today" : ""}`.trim()} key={`${schedule.daysLabel}-${index}`}>
                        <span className="schedule-days">
                            {schedule.daysLabel}
                            {isToday && <span className="today-tag">Hoy</span>}
                        </span>
                        <span className="schedule-time">
                            <Icon name="clock" size={15} />
                            {schedule.startTime} – {schedule.endTime}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
