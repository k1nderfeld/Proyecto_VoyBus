const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const Route = require("./route")

// Días y horario de funcionamiento de un recorrido (ADM-01, RED-01).
// Un recorrido puede tener varios: por ejemplo, uno para lunes a viernes y otro para el fin de semana.
class RouteSchedule extends Model {
    // "1,2,3,4,5" -> [1, 2, 3, 4, 5]. 1 es lunes y 7 es domingo (ISO 8601).
    get dayList() {
        return this.days.split(",").map(Number)
    }
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

RouteSchedule.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    routeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    days: {
        type: DataTypes.STRING(13),
        allowNull: false,
        validate: {
            is: /^[1-7](,[1-7]){0,6}$/
        }
    },

    // "HH:MM". Si endTime es menor que startTime, el servicio termina después de medianoche.
    startTime: {
        type: DataTypes.STRING(5),
        allowNull: false,
        validate: {
            is: TIME_PATTERN
        }
    },

    endTime: {
        type: DataTypes.STRING(5),
        allowNull: false,
        validate: {
            is: TIME_PATTERN
        }
    }
}, {
    sequelize: db,
    modelName: "RouteSchedule",
    tableName: "route_schedules",
    timestamps: true
})

Route.hasMany(RouteSchedule, { foreignKey: "routeId", as: "schedules", onDelete: "CASCADE" })
RouteSchedule.belongsTo(Route, { foreignKey: "routeId", as: "route" })

module.exports = RouteSchedule
