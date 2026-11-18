const { DataTypes, Model, Op } = require("sequelize")
const db = require("../config/database")
const { normalizeSearchText } = require("../utils/search")

// Modelo base de paradero (módulo Red de transporte). Los paraderos no se eliminan:
// se desactivan con "status" para conservar favoritos e historial asociados.
class Stop extends Model {
    static buildSearchText(stop) {
        return normalizeSearchText(`${stop.code} ${stop.name}`)
    }

    // Lo llama syncDatabase: completa "searchText" en las filas creadas antes de que existiera la columna.
    static async afterSchemaSync() {
        const stops = await Stop.findAll({ where: { searchText: { [Op.is]: null } } })

        for (const stop of stops) {
            await stop.update({ searchText: Stop.buildSearchText(stop) })
        }
    }
}

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
    },

    // Código y nombre normalizados para la búsqueda (RED-02). Se calcula al guardar.
    searchText: {
        type: DataTypes.STRING(120),
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: "Stop",
    tableName: "stops",
    timestamps: true,
    indexes: [
        { fields: ["latitude", "longitude"] }
    ],
    hooks: {
        beforeSave: (stop) => {
            stop.searchText = Stop.buildSearchText(stop)
        }
    }
})

module.exports = Stop
