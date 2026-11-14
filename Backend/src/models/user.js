const { DataTypes, Model } = require("sequelize")
const db = require("../config/database")

class User extends Model {
    toJSON() {
        const values = { ...this.get() }
        delete values.password
        delete values.twoFactorSecret
        delete values.failedLoginAttempts
        delete values.lockedUntil
        delete values.passwordResetTokenHash
        delete values.passwordResetExpiresAt
        delete values.deletedAt
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

    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "active"
    },

    failedLoginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },

    lockedUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },

    twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    twoFactorSecret: {
        type: DataTypes.STRING,
        allowNull: true
    },

    passwordResetTokenHash: {
        type: DataTypes.STRING(64),
        allowNull: true
    },

    passwordResetExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
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
