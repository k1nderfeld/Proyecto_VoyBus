# VoyBus

Aplicación móvil para consultar el transporte público de Antofagasta: líneas, recorridos y paraderos, con cuentas de pasajero, favoritos, preferencias e historial de viajes.

Proyecto de la asignatura **Desarrollo de Soluciones Móviles** (2026-20).
Integrantes: Daniel Díaz Vargas y Baltazar Rodríguez Tapia.

## Tecnologías

| Parte | Tecnología |
|---|---|
| App móvil (`Frontend/`) | React Native con Expo SDK 58, expo-router, react-native-maps |
| API (`Backend/`) | Node.js con Express 5 (JavaScript) |
| Base de datos | SQLite con Sequelize |

## Requisitos

- **Node.js 20 o superior** (probado con Node 24).
- **Expo Go** en el teléfono ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) o [iOS](https://apps.apple.com/app/expo-go/id982107779)).
- El PC y el teléfono conectados a **la misma red Wi-Fi**.

## Puesta en marcha

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env    # en Windows (PowerShell): copy .env.example .env
npm run seed
npm run dev
```

- Completa al menos `JWT_SECRET` en `.env`. Las demás variables están explicadas en [`Backend/.env.example`](Backend/.env.example).
- `npm run seed` carga los datos iniciales. Se puede ejecutar varias veces sin duplicar datos.
- `npm run dev` inicia la API en `http://localhost:3000` y se reinicia sola al guardar cambios. `npm start` la inicia sin reinicio automático.
- Las tablas se crean o actualizan solas al iniciar el servidor, sin perder datos.
- Si Windows pregunta si Node.js puede usar la red, permite **redes privadas**: sin eso el teléfono no llega a la API.

### 2. App móvil

```bash
cd Frontend
npm install
npx expo start
```

Escanea el código QR con **Expo Go** (Android) o con la **cámara** (iPhone).

La app usa automáticamente la IP del PC que ejecuta `npx expo start`, con el puerto 3000, así que no hay que configurar nada si todo está en la misma red. Para usar otra dirección (otro equipo, un túnel o el emulador de Android), copia `Frontend/.env.example` como `Frontend/.env` y completa `EXPO_PUBLIC_API_URL`.

Si algo no se actualiza después de cambiar archivos de configuración o el logo, reinicia limpiando la caché:

```bash
npx expo start -c
```

## Datos iniciales y cuentas demo

`npm run seed` crea:

- 4 líneas: 101, 102, 103 (suspendida) y 104 (desactivada, no aparece en la app).
- 11 paraderos: PA001 a PA010, más PA011 (desactivado).
- 6 recorridos (ida y regreso de cada línea) con sus horarios, y 3 vehículos.
- Cuentas demo:

| Cuenta | Correo | Contraseña | Rol |
|---|---|---|---|
| Pasajero | `pasajero@voybus.cl` | `Demo123!` | Pasajero, con 6 viajes en su historial |
| Conductor | `conductor@voybus.cl` | `Demo123!` | Conductor |

La contraseña de las cuentas demo se puede cambiar con `SEED_DEMO_PASSWORD` en `Backend/.env` (antes de ejecutar el seed). Si la contraseña tiene `#`, escríbela entre comillas (`SEED_DEMO_PASSWORD="Clave#123"`): sin comillas, en un `.env` el `#` inicia un comentario y la clave queda cortada. Las cuentas demo ya están verificadas.

En modo desarrollo, la pantalla de inicio de sesión muestra las cuentas demo del pasajero y del conductor con un botón *Usar*. La app las pide al backend (`GET /api/auth/demo-accounts`, que no existe en producción), así que siempre usa la contraseña de `SEED_DEMO_PASSWORD`. Si una cuenta demo cambió de contraseña, deja de ofrecerse.

## Verificación de cuentas, dos pasos y Google

- **Verificar el correo o el teléfono:** las cuentas nuevas quedan pendientes hasta ingresar el código de 6 dígitos que se envía al registrarse (vence en 15 minutos; se puede reenviar cada 60 segundos). Si no hay SMTP configurado, **el código aparece en la consola del backend**. Los SMS son simulados: el mensaje también aparece en la consola. Para enviar SMS reales hay que conectar un proveedor en `Backend/src/services/sms.services.js`.
- **Verificación en dos pasos:** en *Perfil → Seguridad → Activar* se muestra un código QR y la clave para agregar VoyBus a una aplicación autenticadora (Google Authenticator, Microsoft Authenticator u otra). Desde ese momento, el inicio de sesión pide también el código de la aplicación.
- **Google:** el backend ya permite iniciar sesión o crear una cuenta con Google (`POST /api/auth/google`, que recibe el ID token de Google Sign-In). Para usarlo hay que crear las credenciales OAuth en Google Cloud y ponerlas en `GOOGLE_CLIENT_IDS`. El botón en la app queda pendiente: Google Sign-In no funciona en Expo Go y requiere una build de desarrollo.

## Cómo probar la app

1. **Sin iniciar sesión:** en *Líneas*, busca "portada" o "101" y abre una línea. Cambia entre Ida y Regreso: se actualizan el mapa, los paraderos y los horarios. En *Paraderos*, mueve el mapa para cargar los de la zona, o busca "colon" en *Buscar*.
2. **Registro:** en *Perfil*, toca *Crear una cuenta*. La contraseña debe tener entre 8 y 15 caracteres, con mayúscula, minúscula, número y símbolo. Después ingresa el código de verificación (sin SMTP, búscalo en la consola del backend). Si intentas entrar antes de verificar, la app ofrece *Verificar ahora*.
3. **Inicio de sesión:** entra con la cuenta del pasajero demo.
4. **Favoritos:** toca el corazón en una línea o un paradero. Aparecen en la pestaña *Favoritos* y en *Inicio*.
5. **Historial:** en *Perfil → Historial de viajes*, filtra por período o línea y abre un viaje.
6. **Perfil:** cambia el nombre o el alias, elige una foto (se ve una vista previa antes de guardarla) e intenta salir sin guardar.
7. **Preferencias:** elige el tema *Oscuro*: la app cambia al instante y la elección queda guardada en la cuenta.
8. **Seguridad:** cambia la contraseña (las demás sesiones de la cuenta se cierran) o activa la verificación en dos pasos y vuelve a iniciar sesión.
9. **Recuperar contraseña:** sin SMTP configurado no llega el correo. Con SMTP, abre el enlace del correo o pega el enlace o el código en la app.
10. **Conductor:** con la cuenta del conductor no aparecen Favoritos ni Historial.
11. **Cerrar sesión:** en *Perfil → Cerrar sesión*, confirma: la app vuelve a la pantalla de inicio de sesión y no permite volver atrás a la cuenta.

## Comandos útiles

| Carpeta | Comando | Para qué |
|---|---|---|
| `Backend` | `npm run dev` | API con reinicio automático |
| `Backend` | `npm run seed` | Cargar los datos iniciales |
| `Frontend` | `npx expo start` | Iniciar la app (Expo Go) |
| `Frontend` | `npm run lint` | Revisar el código con ESLint |
| `Frontend` | `npm run icons` | Generar los íconos PNG desde `assets/logo.svg` |

## Estructura

```
Backend/
  src/
    config/       configuración (base de datos, sesión, preferencias, red)
    controllers/  reciben la petición y arman la respuesta
    middlewares/  autenticación, roles, validación, subida de fotos
    models/       modelos de Sequelize (usuarios, red, viajes)
    routes/       rutas de la API (/api/auth, /api/users, /api/lines, /api/stops)
    services/     reglas de negocio
    seeders/      datos iniciales
Frontend/
  assets/         logo (logo.svg) e íconos generados
  src/
    app/          pantallas (expo-router: cada archivo es una ruta)
    api/          cliente de la API
    components/   componentes reutilizables
    context/      sesión, favoritos, tema y avisos
    hooks/        carga de datos y listas paginadas
    lib/          formatos, validaciones y utilidades
    theme/        colores (paleta oficial), fuentes y espacios
```

## Flujo de trabajo con Git

- `main`: versiones estables.
- `Develop`: integración del trabajo del equipo.
- Cada requerimiento se desarrolla en una rama `feat/<nombre>` creada desde `Develop`, y vuelve a `Develop` mediante un pull request.
- Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/es/): `feat`, `fix`, `docs`, `refactor`, `test` y `chore`.
