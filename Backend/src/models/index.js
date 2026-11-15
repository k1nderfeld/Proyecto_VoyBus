// Registra todos los modelos y sus asociaciones en un único lugar.
// Lo usan el servidor y el seed para que syncDatabase cree todas las tablas.
module.exports = {
    User: require("./user"),
    Session: require("./session"),
    UserPreference: require("./userPreference"),
    Line: require("./line"),
    Stop: require("./stop"),
    FavoriteLine: require("./favoriteLine"),
    FavoriteStop: require("./favoriteStop"),
    Route: require("./route"),
    RouteStop: require("./routeStop"),
    Vehicle: require("./vehicle"),
    Trip: require("./trip"),
    TripLink: require("./tripLink"),
    StopRequest: require("./stopRequest")
}
