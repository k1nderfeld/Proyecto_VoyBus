// Cuentas demo para desarrollo y pruebas (RNF-04). Las crea "npm run seed" y las ofrece el login de la app.
// Es la única definición: el seed y GET /api/auth/demo-accounts la usan, así nunca quedan distintas.

const DEFAULT_PASSWORD = "Demo123!"

const demoAccounts = [
    { key: "passenger", label: "Pasajero", name: "Pasajero Demo", email: "pasajero@voybus.cl", role: "passenger" },
    { key: "driver", label: "Conductor", name: "Conductor Demo", email: "conductor@voybus.cl", role: "driver" }
]

// Se lee al usarla (y no al cargar el archivo) para respetar el .env aunque se cargue después.
const demoPassword = () => process.env.SEED_DEMO_PASSWORD || DEFAULT_PASSWORD

// En producción no se exponen las cuentas demo.
const demoAccountsEnabled = () => process.env.NODE_ENV !== "production"

module.exports = {
    demoAccounts,
    demoPassword,
    demoAccountsEnabled
}
