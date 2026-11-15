import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "../api/client"
import { AuthShell } from "../components/AuthShell"
import { PasswordField } from "../components/Fields"
import { Icon } from "../components/Icon"
import { PasswordChecklist } from "../components/PasswordChecklist"
import { useToast } from "../context/ToastContext"
import { fieldErrors, isValidNewPassword, newPasswordChecks } from "../lib/validation"

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token") || ""
    const tokenValid = /^[a-f0-9]{64}$/i.test(token)
    const { success, error } = useToast()
    const [form, setForm] = useState({ newPassword: "", confirmPassword: "" })
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const checks = newPasswordChecks(form.newPassword)

    const update = (field) => (event) =>
        setForm((current) => ({ ...current, [field]: event.target.value }))

    const submit = async (event) => {
        event.preventDefault()
        const nextErrors = {}

        if (!isValidNewPassword(form.newPassword)) {
            nextErrors.newPassword = "La contraseña debe tener entre 8 y 72 caracteres, con al menos una letra y un número."
        }
        if (form.confirmPassword !== form.newPassword) {
            nextErrors.confirmPassword = "Las contraseñas no coinciden."
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setSaving(true)
        setErrors({})
        setServerError(null)

        try {
            const response = await api.post(
                "/auth/reset-password",
                { token, newPassword: form.newPassword, confirmPassword: form.confirmPassword },
                { auth: false }
            )
            setDone(true)
            success(response.message)
        } catch (requestError) {
            setErrors(fieldErrors(requestError))
            setServerError(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    if (!tokenValid) {
        return (
            <AuthShell
                title="El enlace no es válido"
                description="El enlace de recuperación está incompleto o ya no es válido."
                footer={
                    <p>
                        <Link to="/login">Volver a iniciar sesión</Link>
                    </p>
                }
            >
                <div className="auth-result is-error">
                    <span className="auth-result-icon">
                        <Icon name="alert" size={30} />
                    </span>
                    <h3>No pudimos validar el enlace</h3>
                    <p>Solicita uno nuevo desde la pantalla de recuperación de contraseña.</p>
                    <div className="auth-result-actions">
                        <Link className="button button-primary button-block" to="/recuperar">
                            Solicitar un enlace nuevo
                        </Link>
                        <Link className="button button-ghost button-block" to="/login">
                            Volver a iniciar sesión
                        </Link>
                    </div>
                </div>
            </AuthShell>
        )
    }

    if (done) {
        return (
            <AuthShell
                title="Contraseña actualizada"
                description="Ya puedes iniciar sesión con tu nueva contraseña."
                footer={
                    <p>
                        <Link to="/login">Iniciar sesión</Link>
                    </p>
                }
            >
                <div className="auth-result">
                    <span className="auth-result-icon">
                        <Icon name="check" size={30} />
                    </span>
                    <h3>Todo listo</h3>
                    <p>Por seguridad, cerramos las sesiones que estaban abiertas. Ingresa nuevamente con tu nueva contraseña.</p>
                    <div className="auth-result-actions">
                        <Link className="button button-primary button-block" to="/login">
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </AuthShell>
        )
    }

    return (
        <AuthShell
            title="Crea una nueva contraseña"
            description="Elige una contraseña distinta a la anterior para proteger tu cuenta."
            footer={
                <p>
                    <Link to="/login">Volver a iniciar sesión</Link>
                </p>
            }
        >
            {serverError && (
                <div className="auth-error" role="alert">
                    <Icon name="alert" size={18} />
                    <span>{serverError}</span>
                </div>
            )}

            <form className="form auth-form" onSubmit={submit} noValidate>
                <div>
                    <PasswordField
                        label="Nueva contraseña"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={update("newPassword")}
                        error={errors.newPassword}
                        autoComplete="new-password"
                        placeholder="Crea una contraseña segura"
                        autoFocus
                    />
                    <PasswordChecklist
                        items={[
                            { label: "Entre 8 y 72 caracteres", met: checks.length },
                            { label: "Al menos una letra", met: checks.letter },
                            { label: "Al menos un número", met: checks.number }
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
                    placeholder="Repite la nueva contraseña"
                />

                <button type="submit" className="button button-primary button-block" disabled={saving}>
                    {saving ? "Actualizando…" : "Actualizar contraseña"}
                </button>
            </form>

            <Link className="auth-back" to="/login">
                <Icon name="arrow-left" size={15} />
                Volver a iniciar sesión
            </Link>
        </AuthShell>
    )
}
