const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const User = require("./user")

class Session extends Model {}

Session.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },

    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: "Session",
    tableName: "sessions",
    timestamps: true
})

User.hasMany(Session, { foreignKey: "userId", as: "sessions" })
Session.belongsTo(User, { foreignKey: "userId", as: "user" })

module.exports = Session
