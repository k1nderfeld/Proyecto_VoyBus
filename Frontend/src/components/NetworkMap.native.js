import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { ANTOFAGASTA_REGION } from "../lib/geo"

const EDGE_PADDING = { top: 60, right: 50, bottom: 60, left: 50 }

// Mapa real (Google Maps en Android, Apple Maps en iOS) para recorridos y paraderos (RED-01, RED-02).
// La versión web (NetworkMap.web.js) tiene las mismas props y solo se usa en desarrollo.
//
// markers: [{ id, latitude, longitude, title, description, color }]
// path: [{ latitude, longitude }] para dibujar un recorrido.
// fitToPoints: encuadra los marcadores y el recorrido al cargar.
// onRegionChange(region): se llama al terminar de mover el mapa (y al inicio).
// onLocationError(mensaje): si el usuario no da permiso de ubicación (RNF-12).
export function NetworkMap({
    markers = [],
    path = [],
    pathColor,
    selectedId,
    onMarkerPress,
    onRegionChange,
    fitToPoints = false,
    showLocateButton = false,
    onLocationError,
    initialRegion = ANTOFAGASTA_REGION,
    style
}) {
    const { colors, isDark, radius } = useTheme()
    const mapRef = useRef(null)
    const [ready, setReady] = useState(false)
    const [locating, setLocating] = useState(false)
    const [hasLocation, setHasLocation] = useState(false)

    const pointsKey = fitToPoints ? JSON.stringify([...markers, ...path].map((point) => [point.latitude, point.longitude])) : ""

    useEffect(() => {
        if (!ready || !fitToPoints) return
        const points = [...path, ...markers].map(({ latitude, longitude }) => ({ latitude, longitude }))
        if (points.length > 1) mapRef.current?.fitToCoordinates(points, { edgePadding: EDGE_PADDING, animated: true })
        else if (points.length === 1) {
            mapRef.current?.animateToRegion({ ...points[0], latitudeDelta: 0.01, longitudeDelta: 0.01 }, 300)
        }
        // pointsKey resume markers y path: solo se vuelve a encuadrar si cambian los puntos.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, pointsKey])

    const locate = async () => {
        setLocating(true)

        try {
            const { status } = await Location.requestForegroundPermissionsAsync()

            if (status !== "granted") {
                onLocationError?.(
                    "Para centrar el mapa en tu ubicación, permite el acceso a la ubicación en los ajustes del teléfono."
                )
                return
            }

            const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
            setHasLocation(true)
            mapRef.current?.animateToRegion(
                {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02
                },
                400
            )
        } catch {
            onLocationError?.("No pudimos obtener tu ubicación. Revisa que el GPS esté activado.")
        } finally {
            setLocating(false)
        }
    }

    return (
        <View style={[styles.wrapper, { borderRadius: radius.lg, borderColor: colors.border }, style]}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={initialRegion}
                onMapReady={() => {
                    setReady(true)
                    onRegionChange?.(initialRegion)
                }}
                onRegionChangeComplete={(region) => onRegionChange?.(region)}
                showsUserLocation={hasLocation}
                showsMyLocationButton={false}
                toolbarEnabled={false}
                userInterfaceStyle={isDark ? "dark" : "light"}
                accessibilityLabel="Mapa de paraderos"
            >
                {path.length > 1 && (
                    <Polyline coordinates={path} strokeColor={pathColor ?? colors.primary} strokeWidth={5} />
                )}
                {markers.map((marker) => (
                    <Marker
                        key={`${marker.id}-${marker.id === selectedId}`}
                        identifier={String(marker.id)}
                        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                        title={marker.title}
                        description={marker.description}
                        pinColor={marker.id === selectedId ? colors.primaryStrong : marker.color ?? colors.accent}
                        onPress={() => onMarkerPress?.(marker.id)}
                    />
                ))}
            </MapView>

            {showLocateButton && (
                <Pressable
                    onPress={locate}
                    disabled={locating}
                    accessibilityRole="button"
                    accessibilityLabel="Centrar el mapa en mi ubicación"
                    style={[styles.locate, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    {locating ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Ionicons name="locate" size={22} color={colors.primary} />
                    )}
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        overflow: "hidden",
        borderWidth: 1,
        minHeight: 220
    },
    locate: {
        position: "absolute",
        right: 12,
        bottom: 12,
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3
    }
})
