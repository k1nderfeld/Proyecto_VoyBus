import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api/client"
import { LineCard } from "../components/LineCard"
import { Icon } from "../components/Icon"
import { SearchBar } from "../components/SearchBar"
import { SectionHeader } from "../components/PageHeader"
import { CardSkeletons, EmptyState, ErrorState, Skeleton } from "../components/States"
import { RouteMap } from "../components/RouteMap"
import { useAuth } from "../context/AuthContext"
import { useFavorites } from "../context/FavoritesContext"
import { useApiData } from "../hooks/useApiData"
import { formatRelative, greeting } from "../lib/format"
import { LineCode } from "../components/LineCard"

const quickLinks = [
    { to: "/lineas", label: "Líneas", description: "Recorridos y horarios", icon: "bus", tone: "violet" },
    { to: "/paraderos", label: "Paraderos", description: "Ubicaciones de la red", icon: "pin", tone: "blue" },
    { to: "/favoritos", label: "Favoritos", description: "Tus accesos guardados", icon: "heart", tone: "lilac" },
    { to: "/historial", label: "Historial", description: "Revisa tus viajes", icon: "history", tone: "navy" }
]

export function HomePage() {
    const { user } = useAuth()
    const { lines: favoriteLines, stops: favoriteStops } = useFavorites()
    const [mode, setMode] = useState("lineas")
    const [query, setQuery] = useState("")
    const navigate = useNavigate()

    const network = useApiData(
        ({ signal }) =>
            Promise.all([api.get("/lines?limit=4", { signal }), api.get("/stops?limit=6", { signal })]).then(
                ([linesResponse, stopsResponse]) => ({
                    lines: linesResponse.data.items,
                    stops: stopsResponse.data.items,
                    lineTotal: linesResponse.data.pagination.total,
                    stopTotal: stopsResponse.data.pagination.total
                })
            ),
        []
    )

    const [activity, setActivity] = useState(null)

    useEffect(() => {
        if (!user) {
            setActivity(null)
            return
        }

        const controller = new AbortController()

        api.get("/users/me/history?limit=2", { signal: controller.signal })
            .then((response) => setActivity(response.data))
            .catch(() => setActivity(null))

        return () => controller.abort()
    }, [user])

    const submitSearch = () => {
        const term = query.trim()
        navigate(`/${mode}${term ? `?q=${encodeURIComponent(term)}` : ""}`)
    }

    const data = network.data
    const lines = data?.lines || []
    const stops = data?.stops || []
    const featuredLine = lines[0]

    return (
        <div className="home">
            <section className="hero">
                <div className="hero-copy">
                    <span className="hero-badge">
                        <Icon name="sparkles" size={15} />
                        {user ? `${greeting()}, ${user.alias || user.name.split(" ")[0]}` : "Bienvenido a VoyBus"}
                    </span>
                    <h1>
                        Tu ciudad,{" "}
                        <br />
                        <span>a un viaje de distancia.</span>
                    </h1>
                    <p className="hero-text">
                        Encuentra tu línea, revisa sus paraderos y planifica tu próxima salida por Antofagasta.
                    </p>

                    <div className="hero-search">
                        <div className="mode-switch" role="tablist" aria-label="Buscar en">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={mode === "lineas"}
                                className={mode === "lineas" ? "is-active" : ""}
                                onClick={() => setMode("lineas")}
                            >
                                <Icon name="bus" size={16} />
                                Líneas
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={mode === "paraderos"}
                                className={mode === "paraderos" ? "is-active" : ""}
                                onClick={() => setMode("paraderos")}
                            >
                                <Icon name="pin" size={16} />
                                Paraderos
                            </button>
                        </div>
                        <SearchBar
                            value={query}
                            onChange={setQuery}
                            onSubmit={submitSearch}
                            placeholder={mode === "lineas" ? "Busca por código o nombre de línea" : "Busca por código o nombre de paradero"}
                            ariaLabel="Buscar en la red"
                        />
                        <div className="hero-suggestions">
                            <span>Prueba con</span>
                            <Link to="/lineas?q=101">Línea 101</Link>
                            <Link to="/paraderos?q=Plaza">Plaza Colón</Link>
                            <Link to="/paraderos?q=Terminal">Terminal</Link>
                        </div>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <strong>{data ? data.lineTotal : "—"}</strong>
                            <span>líneas en la red</span>
                        </div>
                        <span className="hero-stat-separator" />
                        <div className="hero-stat">
                            <strong>{data ? data.stopTotal : "—"}</strong>
                            <span>paraderos activos</span>
                        </div>
                        <span className="hero-stat-separator" />
                        <div className="hero-stat">
                            <strong>{user ? favoriteLines.length + favoriteStops.length : "0"}</strong>
                            <span>favoritos guardados</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    {network.loading ? (
                        <Skeleton className="hero-map-skeleton" />
                    ) : (
                        <RouteMap stops={stops} path={stops} compact className="hero-map" />
                    )}
                    {featuredLine && (
                        <Link className="hero-float hero-float-top" to={`/lineas/${featuredLine.id}`}>
                            <LineCode line={featuredLine} size="sm" />
                            <span>
                                <strong>{featuredLine.name}</strong>
                                <small>
                                    {featuredLine.statusLabel || "En servicio"} · {featuredLine.code}
                                </small>
                            </span>
                            <Icon name="arrow-up-right" size={17} />
                        </Link>
                    )}
                    <div className="hero-float hero-float-bottom">
                        <span className="hero-float-icon">
                            <Icon name="pin" size={17} />
                        </span>
                        <span>
                            <strong>{data ? data.stopTotal : "—"} paraderos</strong>
                            <small>conectados en la ciudad</small>
                        </span>
                    </div>
                </div>
            </section>

            <section className="quick-grid" aria-label="Accesos rápidos">
                {quickLinks.map((link) => (
                    <Link key={link.to} to={link.to} className={`quick-card quick-${link.tone}`}>
                        <span className="quick-icon">
                            <Icon name={link.icon} size={20} />
                        </span>
                        <span className="quick-copy">
                            <strong>{link.label}</strong>
                            <small>{link.description}</small>
                        </span>
                        <Icon name="arrow-right" size={17} className="quick-arrow" />
                    </Link>
                ))}
            </section>

            <section className="home-section">
                <SectionHeader
                    icon="bus"
                    title="Líneas para moverte"
                    description="Recorridos activos y suspendidos de la red."
                    action={
                        <Link className="text-link" to="/lineas">
                            Ver todas
                            <Icon name="arrow-right" size={15} />
                        </Link>
                    }
                />
                {network.loading ? (
                    <CardSkeletons count={4} />
                ) : network.error ? (
                    <ErrorState message={network.error} onRetry={network.reload} />
                ) : lines.length ? (
                    <div className="card-grid">
                        {lines.map((line) => (
                            <LineCard key={line.id} line={line} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="bus"
                        title="Todavía no hay líneas disponibles"
                        description="Cuando la red esté publicada verás aquí sus recorridos."
                    />
                )}
            </section>

            <div className="home-split">
                <section className="home-section home-stops">
                    <SectionHeader
                        icon="pin"
                        title="Paraderos de la red"
                        description="Puntos activos para iniciar o terminar tu viaje."
                        action={
                            <Link className="text-link" to="/paraderos">
                                Ver todos
                                <Icon name="arrow-right" size={15} />
                            </Link>
                        }
                    />
                    {network.loading ? (
                        <div className="mini-list">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="mini-row-skeleton" />
                            ))}
                        </div>
                    ) : (
                        <div className="mini-list">
                            {stops.map((stop) => (
                                <Link to={`/paraderos/${stop.id}`} className="mini-stop" key={stop.id}>
                                    <span className="mini-stop-icon">
                                        <Icon name="pin" size={17} />
                                    </span>
                                    <span className="mini-stop-copy">
                                        <strong>{stop.name}</strong>
                                        <small>{stop.code}</small>
                                    </span>
                                    <span className="mini-stop-lines">
                                        {(stop.lines || []).slice(0, 3).map((line) => (
                                            <span
                                                key={line.id}
                                                className="mini-line-dot"
                                                style={{ "--dot-color": line.color }}
                                                title={`Línea ${line.code}`}
                                            >
                                                {line.code}
                                            </span>
                                        ))}
                                    </span>
                                    <Icon name="chevron-right" size={17} className="mini-arrow" />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="home-aside">
                    {user ? (
                        <div className="panel account-panel">
                            <div className="panel-head">
                                <span className="panel-icon">
                                    <Icon name="history" size={18} />
                                </span>
                                <div>
                                    <h2>Tu actividad</h2>
                                    <p>Los últimos viajes registrados en tu cuenta.</p>
                                </div>
                            </div>
                            {activity?.items?.length ? (
                                <div className="activity-list">
                                    {activity.items.map((entry) => (
                                        <Link to={`/historial/${entry.id}`} className="activity-item" key={entry.id}>
                                            <LineCode line={entry.line} size="sm" />
                                            <span className="activity-copy">
                                                <strong>{entry.line.name}</strong>
                                                <small>
                                                    {entry.route.directionLabel || "Recorrido"} · {formatRelative(entry.linkedAt)}
                                                </small>
                                            </span>
                                            <Icon name="chevron-right" size={16} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="panel-empty">
                                    <Icon name="route" size={20} />
                                    <p>Aún no registras viajes. Cuando lo hagas, aparecerán aquí.</p>
                                </div>
                            )}
                            <Link className="text-link panel-link" to="/historial">
                                Ver historial completo
                                <Icon name="arrow-right" size={15} />
                            </Link>
                        </div>
                    ) : (
                        <div className="panel account-panel panel-cta">
                            <span className="panel-cta-illustration">
                                <Icon name="sparkles" size={24} />
                            </span>
                            <h2>Tu red, siempre a mano</h2>
                            <p>Crea tu cuenta para guardar líneas y paraderos favoritos y revisar tus viajes.</p>
                            <div className="panel-actions">
                                <Link className="button button-primary" to="/registro">
                                    Crear cuenta
                                </Link>
                                <Link className="button button-ghost" to="/login">
                                    Ingresar
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="panel help-panel">
                        <span className="panel-icon">
                            <Icon name="info" size={18} />
                        </span>
                        <div>
                            <h3>¿Cómo funciona?</h3>
                            <p>Busca una línea, revisa sus paraderos y guarda lo que más uses para encontrarlo al instante.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
