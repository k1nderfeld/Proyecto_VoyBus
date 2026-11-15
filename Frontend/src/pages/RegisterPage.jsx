import { useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { AuthShell } from "../components/AuthShell"
import { CheckboxField, PasswordField, TextField } from "../components/Fields"
import { Icon } from "../components/Icon"
import { PasswordChecklist } from "../components/PasswordChecklist"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { fieldErrors, isEmail, isPhone, isValidPassword, passwordChecks } from "../lib/validation"

export function RegisterPage() {
    const { user, register } = useAuth()
    const { success, error } = useToast()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const requestedNext = searchParams.get("next") || "/"
    const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/"

    const [mode, setMode] = useState("email")
    const [form, setForm] = useState({
        name: "",
        identifier: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false
    })
    const [errors, setErrors] = useState({})
    const [sending, setSending] = useState(false)
    const checks = passwordChecks(form.password)

    if (user) return <Navigate to={next} replace />

    const update = (field) => (event) =>
        setForm((current) => ({ ...current, [field]: event.target.value }))

    const changeMode = (value) => {
        setMode(value)
        setErrors((current) => ({ ...current, identifier: undefined, email: undefined, phone: undefined }))
    }

    const submit = async (event) => {
        event.preventDefault()
        const nextErrors = {}
        const name = form.name.trim()
        const identifier = form.identifier.trim()

        if (name.length < 2 || name.length > 80) nextErrors.name = "El nombre debe tener entre 2 y 80 caracteres."
        if (mode === "email" && !isEmail(identifier)) nextErrors.identifier = "Ingresa un correo electrónico válido."
        if (mode === "phone" && !isPhone(identifier)) {
            nextErrors.identifier = "Ingresa un teléfono válido, con entre 8 y 15 dígitos."
        }
        if (!isValidPassword(form.password)) nextErrors.password = "La contraseña no cumple con los requisitos."
        if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Las contraseñas no coinciden."
        if (!form.acceptTerms) nextErrors.acceptTerms = "Debes aceptar los términos y la política de privacidad."

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setSending(true)
        setErrors({})

        try {
            await register({
                name,
                ...(mode === "email" ? { email: identifier } : { phone: identifier }),
                password: form.password,
                confirmPassword: form.confirmPassword,
                acceptTerms: true
            })
            success("Tu cuenta fue creada correctamente.")
            navigate(next, { replace: true })
        } catch (requestError) {
            setErrors(fieldErrors(requestError))
            error(requestError.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <AuthShell
            title="Crea tu cuenta"
            description="Guarda tus líneas y paraderos favoritos y mantén tu historial de viajes en un solo lugar."
            footer={
                <p>
                    ¿Ya tienes una cuenta?{" "}
                    <Link to={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}>
                        Iniciar sesión
                    </Link>
                </p>
            }
        >
            <div className="auth-switch" role="tablist" aria-label="Medio de contacto">
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

            <form className="form auth-form" onSubmit={submit} noValidate>
                <TextField
                    label="Nombre completo"
                    name="name"
                    icon="user"
                    value={form.name}
                    onChange={update("name")}
                    error={errors.name}
                    autoComplete="name"
                    placeholder="Cómo quieres que te llamemos"
                    maxLength={80}
                />

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
                    />
                )}

                <div>
                    <PasswordField
                        label="Contraseña"
                        name="password"
                        value={form.password}
                        onChange={update("password")}
                        error={errors.password}
                        autoComplete="new-password"
                        placeholder="Crea una contraseña segura"
                    />
                    <PasswordChecklist
                        items={[
                            { label: "Entre 8 y 15 caracteres", met: checks.length },
                            { label: "Una mayúscula", met: checks.upper },
                            { label: "Una minúscula", met: checks.lower },
                            { label: "Un número", met: checks.number },
                            { label: "Un símbolo", met: checks.symbol }
                        ]}
                    />
                </div>

                <PasswordField
                    label="Confirmar contraseña"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                />

                <CheckboxField
                    label="Acepto los términos y la política de privacidad de VoyBus."
                    name="acceptTerms"
                    checked={form.acceptTerms}
                    onChange={(event) =>
                        setForm((current) => ({ ...current, acceptTerms: event.target.checked }))
                    }
                    error={errors.acceptTerms}
                />

                <button type="submit" className="button button-primary button-block" disabled={sending}>
                    {sending ? "Creando cuenta…" : "Crear cuenta"}
                </button>
            </form>

            <Link className="auth-back" to="/">
                <Icon name="arrow-left" size={15} />
                Volver al inicio
            </Link>
        </AuthShell>
    )
}
