// Genera los íconos PNG de la app a partir de assets/logo.svg.
// Uso: npm run icons (ejecutarlo cada vez que se cambie el logo).
//
// Expo necesita los íconos en PNG: el SVG solo se usa dentro de la app (componente Logo).
// El script detecta el color de fondo del logo y lo usa como fondo del ícono de Android y de la
// pantalla de carga (actualiza esos dos valores en app.json), para que no se note un borde de otro color.
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const ROOT = path.join(__dirname, "..")
const ASSETS = path.join(ROOT, "assets")
const SOURCE = path.join(ASSETS, "logo.svg")
const APP_JSON = path.join(ROOT, "app.json")
const SIZE = 1024
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }

// Rasteriza el SVG con la resolución justa para que no se vea borroso al tamaño pedido.
const renderLogo = async (svg, size) => {
    const { width = size, height = size } = await sharp(svg).metadata()
    const density = Math.min(Math.ceil((72 * size) / Math.min(width, height)) + 1, 20000)

    return sharp(svg, { density })
        .resize(size, size, { fit: "contain", background: TRANSPARENT })
        .png()
        .toBuffer()
}

const toHex = ({ r, g, b }) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`

// Color más frecuente entre los píxeles opacos: el fondo del logo.
const analyzeLogo = async (png) => {
    const { data, info } = await sharp(png).resize(256, 256).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const counts = new Map()

    for (let index = 0; index < data.length; index += info.channels) {
        if (data[index + 3] < 250) continue
        const key = (data[index] << 16) | (data[index + 1] << 8) | data[index + 2]
        counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const [topColor] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [0x111a5c]
    const background = { r: (topColor >> 16) & 255, g: (topColor >> 8) & 255, b: topColor & 255 }

    return { background }
}

// Silueta blanca de todo lo que no es el fondo del logo (ícono monocromático de Android 13+).
const monochromeFrom = async (png, background) => {
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const output = Buffer.alloc(data.length)

    for (let index = 0; index < data.length; index += 4) {
        const distance =
            Math.abs(data[index] - background.r) + Math.abs(data[index + 1] - background.g) + Math.abs(data[index + 2] - background.b)
        const visible = data[index + 3] > 128 && distance > 60
        output[index] = 255
        output[index + 1] = 255
        output[index + 2] = 255
        output[index + 3] = visible ? 255 : 0
    }

    return sharp(output, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

const canvas = (background) => sharp({ create: { width: SIZE, height: SIZE, channels: 4, background } })

const updateAppJson = (backgroundHex) => {
    const config = JSON.parse(fs.readFileSync(APP_JSON, "utf8"))
    config.expo.android.adaptiveIcon.backgroundColor = backgroundHex

    for (const plugin of config.expo.plugins) {
        if (Array.isArray(plugin) && plugin[0] === "expo-splash-screen") plugin[1].backgroundColor = backgroundHex
    }

    fs.writeFileSync(APP_JSON, `${JSON.stringify(config, null, 2)}\n`)
}

const main = async () => {
    if (!fs.existsSync(SOURCE)) {
        throw new Error(`No se encontró ${SOURCE}. Copia el logo con el nombre logo.svg en la carpeta assets.`)
    }

    const svg = fs.readFileSync(SOURCE)
    const full = await renderLogo(svg, SIZE)
    const { background } = await analyzeLogo(full)
    const backgroundHex = toHex(background)

    // iOS no acepta transparencia en el ícono: lo transparente queda del color de fondo del logo.
    await sharp(full).flatten({ background: backgroundHex }).png().toFile(path.join(ASSETS, "icon.png"))

    // Android recorta el ícono en distintas formas (círculo, cuadrado redondeado…) y solo muestra el 66 % central:
    // el logo va a ese tamaño para que nada quede cortado. Como el fondo del ícono es del mismo color
    // que el fondo del logo, no se nota el borde del logo.
    const foreground = await canvas(TRANSPARENT)
        .composite([{ input: await renderLogo(svg, Math.round(SIZE * 0.66)), gravity: "center" }])
        .png()
        .toBuffer()
    await sharp(foreground).toFile(path.join(ASSETS, "android-icon-foreground.png"))
    await canvas(backgroundHex).png().toFile(path.join(ASSETS, "android-icon-background.png"))
    await sharp(await monochromeFrom(foreground, background)).toFile(path.join(ASSETS, "android-icon-monochrome.png"))

    await sharp(full).toFile(path.join(ASSETS, "splash-icon.png"))
    await sharp(await renderLogo(svg, 48)).toFile(path.join(ASSETS, "favicon.png"))

    updateAppJson(backgroundHex)

    console.log(`Íconos generados en assets/ a partir de logo.svg (color de fondo: ${backgroundHex}).`)
}

main().catch((error) => {
    console.error(error.message)
    process.exit(1)
})
