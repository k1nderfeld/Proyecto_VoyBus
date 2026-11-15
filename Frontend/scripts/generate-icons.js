// Genera los íconos PNG de la app a partir de assets/logo.svg.
// Uso: npm run icons (ejecutarlo cada vez que se cambie el logo).
//
// Expo necesita los íconos en PNG: el SVG solo se usa dentro de la app (componente Logo).
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const ASSETS = path.join(__dirname, "..", "assets")
const SOURCE = path.join(ASSETS, "logo.svg")
const NAVY = "#111A5C"
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

const canvas = (background) =>
    sharp({ create: { width: SIZE, height: SIZE, channels: 4, background } })

const main = async () => {
    if (!fs.existsSync(SOURCE)) {
        throw new Error(`No se encontró ${SOURCE}. Copia el logo con el nombre logo.svg en la carpeta assets.`)
    }

    const svg = fs.readFileSync(SOURCE)
    const full = await renderLogo(svg, SIZE)

    // iOS no acepta transparencia en el ícono: el fondo transparente queda azul oscuro.
    await sharp(full).flatten({ background: NAVY }).png().toFile(path.join(ASSETS, "icon.png"))

    // Android recorta el ícono en distintas formas: el logo va al 66 % para quedar dentro de la zona segura.
    const foreground = await canvas(TRANSPARENT)
        .composite([{ input: await renderLogo(svg, Math.round(SIZE * 0.66)), gravity: "center" }])
        .png()
        .toBuffer()
    await sharp(foreground).toFile(path.join(ASSETS, "android-icon-foreground.png"))
    await canvas(NAVY).png().toFile(path.join(ASSETS, "android-icon-background.png"))

    // Ícono monocromático (Android 13+): la silueta del logo en blanco.
    const alpha = await sharp(foreground).ensureAlpha().extractChannel(3).toBuffer()
    await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: "#FFFFFF" } })
        .joinChannel(alpha)
        .png()
        .toFile(path.join(ASSETS, "android-icon-monochrome.png"))

    await sharp(full).toFile(path.join(ASSETS, "splash-icon.png"))
    await sharp(await renderLogo(svg, 48)).toFile(path.join(ASSETS, "favicon.png"))

    console.log("Íconos generados en assets/ a partir de logo.svg.")
}

main().catch((error) => {
    console.error(error.message)
    process.exit(1)
})
