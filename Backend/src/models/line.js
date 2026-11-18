const { DataTypes, Model, Op } = require("sequelize")
const db = require("../config/database")
const { normalizeSearchText } = require("../utils/search")

// Modelo base de línea (módulo Red de transporte). Las líneas no se eliminan:
// se desactivan con "status" para conservar favoritos e historial asociados.
class Line extends Model {
    static buildSearchText(line) {
        return normalizeSearchText(`${line.code} ${line.name}`)
    }

    // Lo llama syncDatabase: completa "searchText" en las filas creadas antes de que existiera la columna.
    static async afterSchemaSync() {
        const lines = await Line.findAll({ where: { searchText: { [Op.is]: null } } })

        for (const line of lines) {
            await line.update({ searchText: Line.buildSearchText(line) })
        }
    }
}

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
    },

    // Código y nombre normalizados para la búsqueda (RED-01). Se calcula al guardar.
    searchText: {
        type: DataTypes.STRING(120),
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: "Line",
    tableName: "lines",
    timestamps: true,
    hooks: {
        beforeSave: (line) => {
            line.searchText = Line.buildSearchText(line)
        }
    }
})

module.exports = Line
