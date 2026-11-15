import { useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../api/client"
import { PasswordField } from "../components/Fields"
import { Icon } from "../components/Icon"
import { PageHeader } from "../components/PageHeader"
import { PasswordChecklist } from "../components/PasswordChecklist"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { fieldErrors, isValidNewPassword, newPasswordChecks } from "../lib/validation"

const emptyForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
}

export function SecurityPage() {
    const { user } = useAuth()
    const { success, error } = useToast()
    const [form, setForm] = useState(emptyForm)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const checks = newPasswordChecks(form.newPassword)

    const update = (field) => (event) =>
        setForm((current) => ({ ...current, [field]: event.target.value }))

    const submit = async (event) => {
        event.preventDefault()
        const nextErrors = {}

        if (!form.currentPassword) nextErrors.currentPassword = "Ingresa tu contraseña actual."
        if (!isValidNewPassword(form.newPassword)) {
            nextErrors.newPassword = "La contraseña debe tener entre 8 y 72 caracteres, con al menos una letra y un número."
        }
        if (form.confirmPassword !== form.newPassword) nextErrors.confirmPassword = "Las contraseñas no coinciden."
        if (form.newPassword && form.newPassword === form.currentPassword) {
            nextErrors.newPassword = "La nueva contraseña debe ser diferente a la actual."
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setSaving(true)
        setErrors({})

        try {
            const response = await api.post("/auth/change-password", form)
            setForm(emptyForm)
            success(response.message)
        } catch (requestError) {
            setErrors(fieldErrors(requestError))
            error(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="page">
            <PageHeader
                eyebrow="Mi cuenta"
                title="Seguridad"
                description="Protege tu cuenta con una contraseña segura y revisa el estado de tus verificaciones."
            />

            <div className="security-layout">
                <div className="stack">
                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="lock" size={18} />
                            </span>
                            <div>
                                <h2>Cambiar contraseña</h2>
                                <p>Al guardar, se cerrarán las demás sesiones abiertas de tu cuenta.</p>
                            </div>
                        </div>

                        <form className="form" onSubmit={submit} noValidate>
                            <PasswordField
                                label="Contraseña actual"
                                name="currentPassword"
                                value={form.currentPassword}
                                onChange={update("currentPassword")}
                                error={errors.currentPassword}
                                autoComplete="current-password"
                                placeholder="Tu contraseña actual"
                            />
                            <div className="form-grid">
                                <div>
                                    <PasswordField
                                        label="Nueva contraseña"
                                        name="newPassword"
                                        value={form.newPassword}
                                        onChange={update("newPassword")}
                                        error={errors.newPassword}
                                        autoComplete="new-password"
                                        placeholder="Crea una contraseña segura"
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
                                    label="Confirmar nueva contraseña"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={update("confirmPassword")}
                                    error={errors.confirmPassword}
                                    autoComplete="new-password"
                                    placeholder="Repite la nueva contraseña"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="button button-primary" disabled={saving}>
                                    {saving ? "Actualizando…" : "Actualizar contraseña"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="shield" size={18} />
                            </span>
                            <div>
                                <h2>Verificación en dos pasos</h2>
                                <p>Una capa adicional de protección al iniciar sesión.</p>
                            </div>
                        </div>

                        <div className="security-status">
                            <span className={`security-status-icon ${user?.twoFactorEnabled ? "is-on" : ""}`.trim()}>
                                <Icon name={user?.twoFactorEnabled ? "shield" : "lock"} size={22} />
                            </span>
                            <div className="security-status-copy">
                                <strong>
                                    {user?.twoFactorEnabled
                                        ? "La verificación en dos pasos está activa"
                                        : "La verificación en dos pasos está desactivada"}
                                </strong>
                                <p>
                                    {user?.twoFactorEnabled
                                        ? "Cada vez que inicies sesión se solicitará un código de tu aplicación autenticadora."
                                        : "Cuando se active, además de tu contraseña se solicitará un código temporal al iniciar sesión."}
                                </p>
                            </div>
                            <span className={`pill ${user?.twoFactorEnabled ? "pill-success" : "pill-neutral"}`}>
                                {user?.twoFactorEnabled ? "Activada" : "Desactivada"}
                            </span>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="mail" size={18} />
                            </span>
                            <div>
                                <h2>Correo de recuperación</h2>
                                <p>Usamos tu correo para enviarte enlaces de recuperación.</p>
                            </div>
                        </div>

                        <div className="email-row">
                            <div>
                                <span className="field-inline-label">Correo registrado</span>
                                <strong>{user?.email || "Sin correo registrado"}</strong>
                            </div>
                            <Link className="button button-ghost button-small" to="/perfil">
                                <Icon name="edit" size={16} />
                                Gestionar correo
                            </Link>
                        </div>
                    </section>
                </div>

                <aside className="stack">
                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="info" size={18} />
                            </span>
                            <div>
                                <h2>Recomendaciones</h2>
                                <p>Pequeños hábitos que protegen tu cuenta.</p>
                            </div>
                        </div>
                        <ul className="tips-list">
                            <li>
                                <span className="tips-icon">
                                    <Icon name="check" size={14} />
                                </span>
                                Usa una contraseña distinta a la de otros servicios.
                            </li>
                            <li>
                                <span className="tips-icon">
                                    <Icon name="check" size={14} />
                                </span>
                                No compartas tus códigos de verificación con nadie.
                            </li>
                            <li>
                                <span className="tips-icon">
                                    <Icon name="check" size={14} />
                                </span>
                                Mantén actualizado el correo de recuperación.
                            </li>
                            <li>
                                <span className="tips-icon">
                                    <Icon name="check" size={14} />
                                </span>
                                Cierra sesión en equipos que no sean tuyos.
                            </li>
                        </ul>
                    </section>

                    <section className="panel tip-panel">
                        <span className="tip-icon">
                            <Icon name="shield" size={20} />
                        </span>
                        <h3>Tu cuenta, bajo control</h3>
                        <p>Si notas actividad que no reconoces, cambia tu contraseña y revisa tus datos de contacto.</p>
                        <Link className="button button-ghost button-small" to="/perfil">
                            Revisar mi perfil
                            <Icon name="arrow-right" size={15} />
                        </Link>
                    </section>

                    <section className="panel">
                        <div className="panel-links">
                            <Link to="/preferencias">
                                <Icon name="sliders" size={17} />
                                Preferencias
                                <Icon name="chevron-right" size={16} />
                            </Link>
                            <Link to="/historial">
                                <Icon name="history" size={17} />
                                Historial de viajes
                                <Icon name="chevron-right" size={16} />
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}
