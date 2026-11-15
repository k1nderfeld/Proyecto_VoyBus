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
        delete values.emailChangeTokenHash
        delete values.emailChangeExpiresAt
        delete values.verificationCodeHash
        delete values.verificationExpiresAt
        delete values.verificationAttempts
        delete values.verificationSentAt
        delete values.twoFactorPendingSecret
        delete values.googleId
        delete values.deletedAt
        return values
    }
}

// "pending": la cuenta se creó pero falta verificar el correo o teléfono (ACC-01).
User.STATUSES = ["pending", "active", "disabled"]

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

    // La unicidad se define como índice (ver "indexes"): SQLite no permite agregar
    // columnas UNIQUE a una tabla existente.
    alias: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
            is: /^[A-Za-z0-9]{1,15}$/
        }
    },

    photoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },

    pendingEmail: {
        type: DataTypes.STRING(120),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },

    emailChangeTokenHash: {
        type: DataTypes.STRING(64),
        allowNull: true
    },

    emailChangeExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
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
    },

    // Código para verificar el medio de contacto (ACC-01). Se guarda solo su hash.
    verificationCodeHash: {
        type: DataTypes.STRING(64),
        allowNull: true
    },

    verificationExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    verificationAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },

    verificationSentAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Clave de la verificación en dos pasos mientras se configura; pasa a twoFactorSecret al confirmarla.
    twoFactorPendingSecret: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Identificador de la cuenta de Google vinculada. Único (ver "indexes").
    googleId: {
        type: DataTypes.STRING(64),
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    paranoid: true,
    indexes: [
        { name: "users_alias_unique", unique: true, fields: ["alias"] },
        { name: "users_google_id_unique", unique: true, fields: ["googleId"] }
    ]
})

module.exports = User
