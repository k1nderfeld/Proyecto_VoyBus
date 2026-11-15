import { useId, useMemo } from "react"
import { projectStops, polylinePath } from "../lib/geo"
import { Icon } from "./Icon"

export function RouteMap({ stops = [], path, selectedId, onSelect, compact = false, className = "" }) {
    const gradientId = `route-gradient-${useId().replace(/:/g, "")}`
    const points = useMemo(() => projectStops(stops), [stops])
    const pathPoints = useMemo(() => {
        if (!Array.isArray(path) || path.length < 2) return points
        return projectStops(path.map((point, index) => ({ ...point, id: `path-${index}` })))
    }, [path, points])

    if (!stops.length) {
        return (
            <div className={`route-map is-empty ${compact ? "is-compact" : ""} ${className}`.trim()}>
                <span className="map-empty-icon">
                    <Icon name="pin" size={22} />
                </span>
                <p>No hay puntos para mostrar en el mapa.</p>
            </div>
        )
    }

    const line = polylinePath(pathPoints)
    const selected = points.find((point) => point.id === selectedId)
    const labelWidth = selected ? Math.max(120, selected.name.length * 8.5 + 34) : 0
    const labelX = selected ? Math.min(800 - labelWidth - 16, Math.max(16, selected.x - labelWidth / 2)) : 0
    const labelY = selected ? (selected.y > 80 ? selected.y - 58 : selected.y + 30) : 0

    return (
        <div className={`route-map ${compact ? "is-compact" : ""} ${className}`.trim()}>
            <svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa esquemático de paraderos">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="800" y2="460" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6B45FD" />
                        <stop offset="0.55" stopColor="#4D55F6" />
                        <stop offset="1" stopColor="#216AEF" />
                    </linearGradient>
                </defs>

                {pathPoints.length > 1 && (
                    <>
                        <path d={line} fill="none" stroke="var(--map-casing)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                        <path
                            d={line}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth="5.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </>
                )}

                {points.map((point) => {
                    const isEdge = point.index === 0 || point.index === points.length - 1
                    const isSelected = selectedId === point.id
                    const radius = isEdge ? 13 : 8

                    return (
                        <g
                            key={`${point.id}-${point.index}`}
                            className={`map-point ${isSelected ? "is-selected" : ""} ${onSelect ? "is-clickable" : ""}`.trim()}
                            onClick={onSelect ? () => onSelect(point) : undefined}
                            tabIndex={onSelect ? 0 : undefined}
                            role={onSelect ? "button" : undefined}
                            aria-label={`${point.code} ${point.name}`}
                            onKeyDown={
                                onSelect
                                    ? (event) => {
                                          if (event.key === "Enter" || event.key === " ") {
                                              event.preventDefault()
                                              onSelect(point)
                                          }
                                      }
                                    : undefined
                            }
                        >
                            <circle cx={point.x} cy={point.y} r={radius + 7} fill="var(--map-point-halo)" />
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r={radius}
                                fill={isEdge || isSelected ? `url(#${gradientId})` : "var(--map-point)"}
                                stroke={isSelected ? "var(--violet)" : "var(--map-point-ring)"}
                                strokeWidth={isSelected ? 5 : 3.5}
                            />
                            {isEdge && <circle cx={point.x} cy={point.y} r="3.4" fill="#FFFFFF" />}
                            <title>
                                {point.code} · {point.name}
                            </title>
                        </g>
                    )
                })}

                {selected && (
                    <g className="map-label" pointerEvents="none">
                        <rect x={labelX} y={labelY} width={labelWidth} height="36" rx="11" fill="var(--navy)" />
                        <text x={labelX + 14} y={labelY + 23} fill="#FFFFFF" fontSize="14" fontWeight="600">
                            {selected.code}
                        </text>
                        <text
                            x={labelX + 14 + selected.code.length * 9 + 8}
                            y={labelY + 23}
                            fill="#FFFFFF"
                            fillOpacity="0.78"
                            fontSize="13"
                        >
                            {selected.name.length > 18 ? `${selected.name.slice(0, 17)}…` : selected.name}
                        </text>
                    </g>
                )}
            </svg>

            <span className="map-badge">
                <Icon name="locate" size={14} />
                Antofagasta
            </span>
        </div>
    )
}
