const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")

class User extends Model {
    toJSON() {
        const values = { ...this.get() }
        delete values.password
        return values
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING(80),
        allowNull: false
    },

    email: {
        type: DataTypes.STRING(120),
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "passenger"
    },

    acceptedTermsAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: db,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    paranoid: true
})

module.exports = User
