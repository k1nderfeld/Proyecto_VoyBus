const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const User = require("./user")
const Trip = require("./trip")

// Vinculación de un pasajero con el viaje en el que va (VIA-01).
// Termina cuando el pasajero se desvincula o cuando el viaje finaliza.
class TripLink extends Model {}

TripLink.METHODS = ["qr", "manual"]
TripLink.END_REASONS = ["unlinked", "trip_ended"]

TripLink.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    tripId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // null para pasajeros invitados (VIA-01 permite vincularse sin cuenta); no forman parte de un historial.
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    method: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "qr",
        validate: {
            isIn: [TripLink.METHODS]
        }
    },

    linkedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    // null mientras la vinculación sigue activa.
    endedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    endReason: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            isIn: [TripLink.END_REASONS]
        }
    }
}, {
    sequelize: db,
    modelName: "TripLink",
    tableName: "trip_links",
    timestamps: true,
    indexes: [
        { fields: ["userId", "linkedAt"] }
    ]
})

User.hasMany(TripLink, { foreignKey: "userId", as: "tripLinks", onDelete: "CASCADE" })
TripLink.belongsTo(User, { foreignKey: "userId", as: "user" })
Trip.hasMany(TripLink, { foreignKey: "tripId", as: "links", onDelete: "RESTRICT" })
TripLink.belongsTo(Trip, { foreignKey: "tripId", as: "trip" })

module.exports = TripLink
