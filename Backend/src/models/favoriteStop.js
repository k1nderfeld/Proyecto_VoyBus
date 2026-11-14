const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const User = require("./user")
const Stop = require("./stop")

class FavoriteStop extends Model {}

FavoriteStop.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    stopId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: db,
    modelName: "FavoriteStop",
    tableName: "favorite_stops",
    timestamps: true,
    updatedAt: false,
    indexes: [
        { unique: true, fields: ["userId", "stopId"] }
    ]
})

User.hasMany(FavoriteStop, { foreignKey: "userId", as: "favoriteStops", onDelete: "CASCADE" })
FavoriteStop.belongsTo(User, { foreignKey: "userId", as: "user" })
Stop.hasMany(FavoriteStop, { foreignKey: "stopId", as: "favorites", onDelete: "RESTRICT" })
FavoriteStop.belongsTo(Stop, { foreignKey: "stopId", as: "stop" })

module.exports = FavoriteStop
