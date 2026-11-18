const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const User = require("./user")
const Line = require("./line")

class FavoriteLine extends Model {}

FavoriteLine.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    lineId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: db,
    modelName: "FavoriteLine",
    tableName: "favorite_lines",
    timestamps: true,
    updatedAt: false,
    indexes: [
        { unique: true, fields: ["userId", "lineId"] }
    ]
})

User.hasMany(FavoriteLine, { foreignKey: "userId", as: "favoriteLines", onDelete: "CASCADE" })
FavoriteLine.belongsTo(User, { foreignKey: "userId", as: "user" })
Line.hasMany(FavoriteLine, { foreignKey: "lineId", as: "favorites", onDelete: "RESTRICT" })
FavoriteLine.belongsTo(Line, { foreignKey: "lineId", as: "line" })

module.exports = FavoriteLine
