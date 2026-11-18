const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const User = require("./user")
const Route = require("./route")
const Vehicle = require("./vehicle")

// Viaje de un vehículo sobre un recorrido (VEH-01): se crea al iniciarlo y se cierra al finalizarlo.
class Trip extends Model {}

Trip.STATUSES = ["in_progress", "finished"]

Trip.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    routeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    driverId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "in_progress",
        validate: {
            isIn: [Trip.STATUSES]
        }
    },

    startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    endedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: "Trip",
    tableName: "trips",
    timestamps: true
})

Route.hasMany(Trip, { foreignKey: "routeId", as: "trips", onDelete: "RESTRICT" })
Trip.belongsTo(Route, { foreignKey: "routeId", as: "route" })
Vehicle.hasMany(Trip, { foreignKey: "vehicleId", as: "trips", onDelete: "RESTRICT" })
Trip.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" })
User.hasMany(Trip, { foreignKey: "driverId", as: "drivenTrips", onDelete: "SET NULL" })
Trip.belongsTo(User, { foreignKey: "driverId", as: "driver" })

module.exports = Trip
