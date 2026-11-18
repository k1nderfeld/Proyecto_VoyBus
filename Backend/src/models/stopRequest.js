const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const TripLink = require("./tripLink")
const Stop = require("./stop")

// Solicitud digital de parada (VIA-02) y su seguimiento (VIA-03).
// No existe un estado "atendida": el sistema no puede confirmar que el vehículo se detuvo ni que el pasajero bajó.
class StopRequest extends Model {}

StopRequest.STATUSES = ["sent", "next", "closed"]
StopRequest.CLOSE_REASONS = ["stop_passed", "trip_ended", "cancelled", "unlinked"]

StopRequest.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    tripLinkId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    stopId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "sent",
        validate: {
            isIn: [StopRequest.STATUSES]
        }
    },

    // Solo se informa cuando status es "closed".
    closeReason: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            isIn: [StopRequest.CLOSE_REASONS]
        }
    },

    requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    closedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: "StopRequest",
    tableName: "stop_requests",
    timestamps: true
})

TripLink.hasMany(StopRequest, { foreignKey: "tripLinkId", as: "stopRequests", onDelete: "CASCADE" })
StopRequest.belongsTo(TripLink, { foreignKey: "tripLinkId", as: "tripLink" })
Stop.hasMany(StopRequest, { foreignKey: "stopId", as: "stopRequests", onDelete: "RESTRICT" })
StopRequest.belongsTo(Stop, { foreignKey: "stopId", as: "stop" })

module.exports = StopRequest
