// Sincroniza el esquema sin perder datos.
// 1. Agrega a las tablas existentes las columnas nuevas de los modelos (ALTER TABLE ADD COLUMN).
// 2. db.sync() crea las tablas e índices que falten.
// 3. Cada modelo puede definir afterSchemaSync() para completar columnas nuevas en filas existentes.
// No se usa sync({ alter: true }) porque en SQLite recrea las tablas y, al eliminar "users",
// borra en cascada sesiones, preferencias y favoritos.
const syncDatabase = async (db) => {
    const queryInterface = db.getQueryInterface()

    for (const model of Object.values(db.models)) {
        const tableName = model.getTableName()
        const columns = await queryInterface.describeTable(tableName).catch(() => ({}))

        if (!Object.keys(columns).length) continue

        for (const [attributeName, attribute] of Object.entries(model.getAttributes())) {
            const columnName = attribute.field || attributeName

            if (columns[columnName]) continue

            await queryInterface.addColumn(tableName, columnName, {
                type: attribute.type,
                allowNull: attribute.allowNull !== false,
                defaultValue: attribute.defaultValue
            })
        }
    }

    await db.sync()

    for (const model of Object.values(db.models)) {
        if (typeof model.afterSchemaSync === "function") {
            await model.afterSchemaSync()
        }
    }
}

module.exports = syncDatabase
