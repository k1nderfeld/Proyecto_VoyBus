const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")

// Modelo base de paradero (módulo Red de transporte). Los paraderos no se eliminan:
// se desactivan con "status" para conservar favoritos e historial asociados.
class Stop extends Model {}

Stop.STATUSES = ["active", "inactive"]

Stop.init({
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

    name: {
        type: DataTypes.STRING(80),
        allowNull: false
    },

    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: -90,
            max: 90
        }
    },

    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: -180,
            max: 180
        }
    },

    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "active",
        validate: {
            isIn: [Stop.STATUSES]
        }
    }
}, {
    sequelize: db,
    modelName: "Stop",
    tableName: "stops",
    timestamps: true
})

module.exports = Stop
