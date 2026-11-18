import { useEffect, useMemo, useRef } from "react"
import { StyleSheet, View } from "react-native"
import { AppText } from "./AppText"
import { useTheme } from "../context/ThemeContext"
import { ANTOFAGASTA_REGION, polylinePath, projectStops } from "../lib/geo"

const WIDTH = 800
const HEIGHT = 460

// Versión web del mapa, solo para probar en el navegador durante el desarrollo:
// react-native-maps no funciona en web. Dibuja un esquema (SVG del navegador) con los mismos datos
// y las mismas props que NetworkMap.native.js. En el teléfono siempre se usa el mapa real.
export function NetworkMap({
    markers = [],
    path = [],
    pathColor,
    selectedId,
    onMarkerPress,
    onRegionChange,
    initialRegion = ANTOFAGASTA_REGION,
    style
}) {
    const { colors, radius } = useTheme()
    const regionRef = useRef(onRegionChange)

    useEffect(() => {
        regionRef.current = onRegionChange
    })

    // Sin mapa que mover, se informa una sola zona amplia para que se carguen los paraderos.
    useEffect(() => {
        regionRef.current?.(initialRegion)
    }, [initialRegion])

    const projected = useMemo(() => {
        const points = projectStops([...path, ...markers], { width: WIDTH, height: HEIGHT, padding: 40 })
        return { path: points.slice(0, path.length), markers: points.slice(path.length) }
    }, [markers, path])

    return (
        <View
            style={[
                styles.wrapper,
                { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                style
            ]}
        >
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Mapa esquemático"
            >
                {projected.path.length > 1 && (
                    <path
                        d={polylinePath(projected.path)}
                        fill="none"
                        stroke={pathColor ?? colors.primary}
                        strokeWidth={8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
                {projected.markers.map((marker) => {
                    const selected = marker.id === selectedId

                    return (
                        <circle
                            key={marker.id}
                            cx={marker.x}
                            cy={marker.y}
                            r={selected ? 16 : 11}
                            fill={selected ? colors.primaryStrong : marker.color ?? colors.accent}
                            stroke={colors.surface}
                            strokeWidth={4}
                            style={{ cursor: onMarkerPress ? "pointer" : "default" }}
                            onClick={() => onMarkerPress?.(marker.id)}
                        >
                            <title>{marker.title}</title>
                        </circle>
                    )
                })}
            </svg>
            <View style={[styles.caption, { backgroundColor: colors.surface }]}>
                <AppText variant="caption" tone="muted">
                    Vista esquemática (en el teléfono se muestra el mapa real)
                </AppText>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        overflow: "hidden",
        borderWidth: 1,
        minHeight: 220
    },
    caption: {
        position: "absolute",
        left: 10,
        bottom: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8
    }
})
