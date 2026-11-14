const fs = require("fs")
const path = require("path")
const { Sequelize } = require("sequelize")

const databaseName = process.env.DATABASE_NAME || "voybus"
const databaseDir = path.join(__dirname, "..", "database")

fs.mkdirSync(databaseDir, { recursive: true })

const db = new Sequelize({
    dialect: "sqlite",
    logging: false,
    storage: path.join(databaseDir, `${databaseName}.sqlite`)
})

module.exports = db
