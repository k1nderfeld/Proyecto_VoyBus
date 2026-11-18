const Server = require("./server")
const server = new Server()

server.listen().catch((error) => {
    console.error("No se pudo iniciar el servidor:", error.message)
    process.exit(1)
})
