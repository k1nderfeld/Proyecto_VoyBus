import { Platform } from "react-native"
import * as ImagePicker from "expo-image-picker"

const MAX_BYTES = 2 * 1024 * 1024
const PICKER_OPTIONS = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7
}

// Elige una foto de la galería o la cámara (recortada en cuadrado) para la foto de perfil (ACC-05).
// Devuelve el archivo elegido, null si la persona canceló, o lanza un Error con un mensaje para mostrar.
export async function pickProfilePhoto(source) {
    if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync()

        if (!permission.granted) {
            throw new Error("Para tomar una foto, permite el acceso a la cámara en los ajustes del teléfono.")
        }
    }

    const result =
        source === "camera"
            ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
            : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS)

    if (result.canceled || !result.assets?.length) return null

    const asset = result.assets[0]

    // El backend acepta hasta 2 MB (JPG, PNG o WEBP).
    if (asset.fileSize && asset.fileSize > MAX_BYTES) {
        throw new Error("La imagen supera los 2 MB. Elige otra o recórtala más.")
    }

    return asset
}

// Arma el formulario multipart que espera PUT /users/me/photo (campo "photo").
export async function buildPhotoForm(asset) {
    const type = asset.mimeType || "image/jpeg"
    const extension = type.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
    const name = asset.fileName || `perfil.${extension}`
    const form = new FormData()

    if (Platform.OS === "web") {
        const blob = await (await fetch(asset.uri)).blob()
        form.append("photo", blob, name)
    } else {
        form.append("photo", { uri: asset.uri, name, type })
    }

    return form
}
