// Carga los datos iniciales. Es idempotente: se puede ejecutar varias veces sin duplicar registros.
// Uso: npm run seed
require("dotenv").config({ quiet: true })

const db = require("../config/database")
const syncDatabase = require("../utils/syncDatabase")
require("../models/user")
require("../models/session")
require("../models/userPreference")
require("../models/line")
require("../models/stop")
require("../models/favoriteLine")
require("../models/favoriteStop")
const seedNetwork = require("./network.seed")

const run = async () => {
    await db.authenticate()
    await syncDatabase(db)
    await seedNetwork()
    await db.close()
}

run().catch((error) => {
    console.error("No se pudieron cargar los datos iniciales:", error.message)
    process.exit(1)
})
