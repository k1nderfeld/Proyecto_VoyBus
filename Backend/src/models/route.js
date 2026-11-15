const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const Line = require("./line")

// Recorrido de una línea en un sentido (ADM-01). Como las líneas, no se elimina: se desactiva con "status".
class Route extends Model {}

Route.DIRECTIONS = ["outbound", "inbound"]
Route.STATUSES = ["active", "inactive"]

Route.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    lineId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    name: {
        type: DataTypes.STRING(80),
        allowNull: false
    },

    // outbound = ida, inbound = regreso.
    direction: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [Route.DIRECTIONS]
        }
    },

    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "active",
        validate: {
            isIn: [Route.STATUSES]
        }
    }
}, {
    sequelize: db,
    modelName: "Route",
    tableName: "routes",
    timestamps: true
})

Line.hasMany(Route, { foreignKey: "lineId", as: "routes", onDelete: "RESTRICT" })
Route.belongsTo(Line, { foreignKey: "lineId", as: "line" })

module.exports = Route
