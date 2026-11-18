const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")

// Vehículo de la flota (ADM-02). "code" es el que aparece en el QR o se ingresa a mano para vincularse (VIA-01).
class Vehicle extends Model {}

Vehicle.STATUSES = ["operational", "operational_with_notes", "out_of_service"]

Vehicle.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    },

    plate: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    },

    status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "operational",
        validate: {
            isIn: [Vehicle.STATUSES]
        }
    }
}, {
    sequelize: db,
    modelName: "Vehicle",
    tableName: "vehicles",
    timestamps: true
})

module.exports = Vehicle
