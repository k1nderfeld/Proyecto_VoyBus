const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")
const User = require("./user")
const { preferenceDefinitions } = require("../config/preferences")

class UserPreference extends Model {}

const preferenceAttributes = Object.fromEntries(
    preferenceDefinitions.map((definition) => {
        const attribute = definition.type === "enum"
            ? {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: definition.defaultValue,
                validate: {
                    isIn: [definition.options.map((option) => option.value)]
                }
            }
            : {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: definition.defaultValue
            }

        return [definition.column, attribute]
    })
)

UserPreference.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },

    ...preferenceAttributes
}, {
    sequelize: db,
    modelName: "UserPreference",
    tableName: "user_preferences",
    timestamps: true
})

User.hasOne(UserPreference, { foreignKey: "userId", as: "preferences", onDelete: "CASCADE" })
UserPreference.belongsTo(User, { foreignKey: "userId", as: "user" })

module.exports = UserPreference
