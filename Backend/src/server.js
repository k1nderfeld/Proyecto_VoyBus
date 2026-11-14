const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
require("dotenv").config({ quiet: true })

const db = require("./config/database")
const User = require("./models/user")
const Session = require("./models/session")
const UserPreference = require("./models/userPreference")

class Server {
    constructor() {
        this.app = express()
        this.port = process.env.PORT || 3000
        this.paths = {
            auth: "/api/auth",
            users: "/api/users"
        }

        this.middlewares()
        this.routes()
    }

    middlewares() {
        this.app.use(morgan("dev"))
        this.app.use(cors())
        this.app.use(express.json())
    }

    routes() {
        this.app.use(this.paths.auth, require("./routes/auth.routes"))
        this.app.use(this.paths.users, require("./routes/user.routes"))
    }

    async connectDatabase() {
        await db.authenticate()
        await db.sync({ force: false })
    }

    async listen() {
        await this.connectDatabase()

        this.app.listen(this.port, () => {
            console.log(`Servidor disponible en http://localhost:${this.port}`)
        })
    }
}

module.exports = Server
