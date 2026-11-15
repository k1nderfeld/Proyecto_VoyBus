import { useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { AuthShell } from "../components/AuthShell"
import { PasswordField, TextField } from "../components/Fields"
import { Icon } from "../components/Icon"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { fieldErrors } from "../lib/validation"

const demoCredentials = {
    email: "pasajero@voybus.cl",
    password: "Demo123!"
}

export function LoginPage() {
    const { user, login } = useAuth()
    const { success, error, info } = useToast()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const requestedNext = searchParams.get("next") || "/"
    const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/"

    const [mode, setMode] = useState("email")
    const [form, setForm] = useState({ identifier: "", password: "", twoFactorCode: "" })
    const [twoFactor, setTwoFactor] = useState(false)
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [sending, setSending] = useState(false)

    if (user) return <Navigate to={next} replace />

    const update = (field) => (event) =>
        setForm((current) => ({ ...current, [field]: event.target.value }))

    const changeMode = (value) => {
        setMode(value)
        setErrors({})
        setServerError(null)
    }

    const fillDemo = () => {
        setMode("email")
        setTwoFactor(false)
        setErrors({})
        setServerError(null)
        setForm({ identifier: demoCredentials.email, password: demoCredentials.password, twoFactorCode: "" })
    }

    const submit = async (event) => {
        event.preventDefault()
        const nextErrors = {}
        const identifier = form.identifier.trim()

        if (!identifier) nextErrors.identifier = `Ingresa tu ${mode === "email" ? "correo electrónico" : "teléfono"}.`
        if (!form.password) nextErrors.password = "Ingresa tu contraseña."
        if (twoFactor && !/^\d{6}$/.test(form.twoFactorCode.trim())) {
            nextErrors.twoFactorCode = "El código debe tener 6 dígitos."
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setSending(true)
        setErrors({})
        setServerError(null)

        try {
            const credentials = {
                password: form.password,
                ...(mode === "email" ? { email: identifier } : { phone: identifier }),
                ...(twoFactor ? { twoFactorCode: form.twoFactorCode.trim() } : {})
            }

            await login(credentials)
            success("Sesión iniciada correctamente.")
            navigate(next, { replace: true })
        } catch (requestError) {
            setErrors(fieldErrors(requestError))

            if (requestError.data?.requiresTwoFactor) {
                setTwoFactor(true)
                info("Ingresa el código de tu aplicación autenticadora para continuar.")
            } else {
                setServerError(requestError.message)
            }
        } finally {
            setSending(false)
        }
    }

    return (
        <AuthShell
            title="Inicia sesión"
            description="Accede para guardar tus favoritos y revisar tus viajes por Antofagasta."
            footer={
                <p>
                    ¿Aún no tienes cuenta?{" "}
                    <Link to={`/registro${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}>
                        Crear una cuenta
                    </Link>
                </p>
            }
        >
            <div className="auth-switch" role="tablist" aria-label="Medio de acceso">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "email"}
                    className={mode === "email" ? "is-active" : ""}
                    onClick={() => changeMode("email")}
                >
                    <Icon name="mail" size={16} />
                    Correo
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "phone"}
                    className={mode === "phone" ? "is-active" : ""}
                    onClick={() => changeMode("phone")}
                >
                    <Icon name="phone" size={16} />
                    Teléfono
                </button>
            </div>

            {serverError && (
                <div className="auth-error" role="alert">
                    <Icon name="alert" size={18} />
                    <span>{serverError}</span>
                </div>
            )}

            {twoFactor && !serverError && (
                <div className="auth-note">
                    <Icon name="shield" size={17} />
                    <span>Tu cuenta tiene verificación en dos pasos. Ingresa el código de 6 dígitos.</span>
                </div>
            )}

            <form className="form auth-form" onSubmit={submit} noValidate>
                {mode === "email" ? (
                    <TextField
                        label="Correo electrónico"
                        name="identifier"
                        type="email"
                        icon="mail"
                        value={form.identifier}
                        onChange={update("identifier")}
                        error={errors.identifier || errors.email}
                        autoComplete="email"
                        placeholder="tu@correo.cl"
                        autoFocus
                    />
                ) : (
                    <TextField
                        label="Teléfono"
                        name="identifier"
                        type="tel"
                        icon="phone"
                        value={form.identifier}
                        onChange={update("identifier")}
                        error={errors.identifier || errors.phone}
                        autoComplete="tel"
                        placeholder="+56912345678"
                        autoFocus
                    />
                )}

                <PasswordField
                    label="Contraseña"
                    name="password"
                    value={form.password}
                    onChange={update("password")}
                    error={errors.password}
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                />

                {twoFactor && (
                    <TextField
                        label="Código de verificación"
                        name="twoFactorCode"
                        icon="shield"
                        value={form.twoFactorCode}
                        onChange={update("twoFactorCode")}
                        error={errors.twoFactorCode}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                    />
                )}

                <div className="auth-row">
                    <Link className="auth-link" to="/recuperar">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <button type="submit" className="button button-primary button-block" disabled={sending}>
                    {sending ? "Ingresando…" : twoFactor ? "Verificar e ingresar" : "Ingresar"}
                </button>
            </form>

            <div className="demo-card">
                <span className="demo-icon">
                    <Icon name="sparkles" size={17} />
                </span>
                <div className="demo-copy">
                    <strong>Cuenta de demostración</strong>
                    <small>{demoCredentials.email} · {demoCredentials.password}</small>
                </div>
                <button type="button" className="button button-ghost button-small" onClick={fillDemo}>
                    Usar
                </button>
            </div>

            <Link className="auth-back" to="/">
                <Icon name="arrow-left" size={15} />
                Volver al inicio
            </Link>
        </AuthShell>
    )
}
