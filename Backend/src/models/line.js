const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")

// Modelo base de línea (módulo Red de transporte). Las líneas no se eliminan:
// se desactivan con "status" para conservar favoritos e historial asociados.
class Line extends Model {}

Line.STATUSES = ["active", "suspended", "inactive"]

Line.init({
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

    color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        validate: {
            is: /^#[0-9A-Fa-f]{6}$/
        }
    },

    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "active",
        validate: {
            isIn: [Line.STATUSES]
        }
    }
}, {
    sequelize: db,
    modelName: "Line",
    tableName: "lines",
    timestamps: true
})

module.exports = Line
