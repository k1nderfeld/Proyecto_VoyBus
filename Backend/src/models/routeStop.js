const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const Route = require("./route")
const Stop = require("./stop")

// Paraderos de un recorrido con su orden (VIA-02 usa "position" para saber cuáles ya se superaron).
class RouteStop extends Model {}

RouteStop.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    routeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    stopId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    }
}, {
    sequelize: db,
    modelName: "RouteStop",
    tableName: "route_stops",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["routeId", "position"] },
        { unique: true, fields: ["routeId", "stopId"] }
    ]
})

Route.hasMany(RouteStop, { foreignKey: "routeId", as: "routeStops", onDelete: "RESTRICT" })
RouteStop.belongsTo(Route, { foreignKey: "routeId", as: "route" })
Stop.hasMany(RouteStop, { foreignKey: "stopId", as: "routeStops", onDelete: "RESTRICT" })
RouteStop.belongsTo(Stop, { foreignKey: "stopId", as: "stop" })

module.exports = RouteStop
