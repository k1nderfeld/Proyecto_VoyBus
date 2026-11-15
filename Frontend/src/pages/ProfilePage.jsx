import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api/client"
import { Avatar } from "../components/Avatar"
import { PasswordField, TextField } from "../components/Fields"
import { Icon } from "../components/Icon"
import { Modal } from "../components/Modal"
import { PageHeader } from "../components/PageHeader"
import { useAuth } from "../context/AuthContext"
import { useFavorites } from "../context/FavoritesContext"
import { useToast } from "../context/ToastContext"
import { formatDate, formatDateTime } from "../lib/format"
import { aliasPattern, fieldErrors, isEmail } from "../lib/validation"

const roleLabels = {
    passenger: "Pasajero",
    driver: "Conductor",
    admin: "Administrador"
}

const statusLabels = {
    active: "Activa",
    disabled: "Deshabilitada",
    pending: "Pendiente de verificación"
}

export function ProfilePage() {
    const { user, updateUser, refresh, logout } = useAuth()
    const { lines, stops } = useFavorites()
    const { success, error } = useToast()
    const navigate = useNavigate()
    const fileInput = useRef(null)

    const [profile, setProfile] = useState(user)
    const [form, setForm] = useState({ name: user?.name || "", alias: user?.alias || "" })
    const [formErrors, setFormErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [photoBusy, setPhotoBusy] = useState(false)
    const [emailOpen, setEmailOpen] = useState(false)
    const [emailBusy, setEmailBusy] = useState(false)
    const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" })
    const [emailErrors, setEmailErrors] = useState({})

    useEffect(() => {
        if (!user) return
        setProfile(user)
        setForm({ name: user.name || "", alias: user.alias || "" })
    }, [user])

    const saveProfile = async (event) => {
        event.preventDefault()
        const nextErrors = {}
        const name = form.name.trim()
        const alias = form.alias.trim()

        if (name.length < 2 || name.length > 80) nextErrors.name = "El nombre debe tener entre 2 y 80 caracteres."
        if (alias && !aliasPattern.test(alias)) nextErrors.alias = "Usa hasta 15 caracteres alfanuméricos, sin espacios ni símbolos."

        if (Object.keys(nextErrors).length) {
            setFormErrors(nextErrors)
            return
        }

        if (name === profile.name && alias === (profile.alias || "")) {
            success("No hay cambios por guardar.")
            return
        }

        setSaving(true)
        setFormErrors({})

        try {
            const response = await api.patch("/users/me", { name, alias: alias || null })
            updateUser(response.data)
            setProfile(response.data)
            success("Perfil actualizado correctamente.")
        } catch (requestError) {
            setFormErrors(fieldErrors(requestError))
            error(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    const uploadPhoto = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            error("La imagen debe ser JPG, PNG o WEBP.")
            event.target.value = ""
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            error("La imagen no puede superar los 2 MB.")
            event.target.value = ""
            return
        }

        const formData = new FormData()
        formData.append("photo", file)

        setPhotoBusy(true)

        try {
            const response = await api.put("/users/me/photo", formData, { form: true })
            updateUser(response.data)
            setProfile(response.data)
            success("Foto de perfil actualizada correctamente.")
        } catch (requestError) {
            error(requestError.message)
        } finally {
            setPhotoBusy(false)
            event.target.value = ""
        }
    }

    const removePhoto = async () => {
        setPhotoBusy(true)

        try {
            const response = await api.delete("/users/me/photo")
            updateUser(response.data)
            setProfile(response.data)
            success("Foto de perfil eliminada correctamente.")
        } catch (requestError) {
            error(requestError.message)
        } finally {
            setPhotoBusy(false)
        }
    }

    const requestEmailChange = async (event) => {
        event.preventDefault()
        const nextErrors = {}

        if (!isEmail(emailForm.newEmail)) nextErrors.newEmail = "Ingresa un correo electrónico válido."
        if (!emailForm.currentPassword) nextErrors.currentPassword = "Ingresa tu contraseña actual."

        if (Object.keys(nextErrors).length) {
            setEmailErrors(nextErrors)
            return
        }

        setEmailBusy(true)
        setEmailErrors({})

        try {
            const response = await api.post("/users/me/email-change", emailForm)
            await refresh()
            setEmailOpen(false)
            setEmailForm({ newEmail: "", currentPassword: "" })
            success(response.message)
        } catch (requestError) {
            setEmailErrors(fieldErrors(requestError))
            error(requestError.message)
        } finally {
            setEmailBusy(false)
        }
    }

    const cancelEmailChange = async () => {
        setEmailBusy(true)

        try {
            const response = await api.delete("/users/me/email-change")
            updateUser(response.data)
            setProfile(response.data)
            success(response.message)
        } catch (requestError) {
            error(requestError.message)
        } finally {
            setEmailBusy(false)
        }
    }

    const onLogout = async () => {
        try {
            await logout()
            success("Cerraste sesión correctamente.")
            navigate("/")
        } catch (requestError) {
            error(requestError.message)
        }
    }

    if (!profile) return null

    return (
        <div className="page">
            <PageHeader
                eyebrow="Mi cuenta"
                title="Mi perfil"
                description="Administra tus datos personales, tu foto y los medios de contacto de tu cuenta."
                actions={
                    <button type="button" className="button button-ghost button-small" onClick={onLogout}>
                        <Icon name="logout" size={16} />
                        Cerrar sesión
                    </button>
                }
            />

            <div className="profile-layout">
                <div className="stack">
                    <section className="panel profile-photo-panel">
                        <div className="profile-photo">
                            <Avatar user={profile} size={96} />
                            <div className="profile-photo-copy">
                                <h2>{profile.name}</h2>
                                <p>
                                    {profile.alias ? `@${profile.alias}` : "Sin alias"} · {profile.email || profile.phone}
                                </p>
                                <span className="pill pill-success">{roleLabels[profile.role] || profile.role}</span>
                            </div>
                        </div>

                        <div className="profile-photo-actions">
                            <input
                                ref={fileInput}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                onChange={uploadPhoto}
                            />
                            <button
                                type="button"
                                className="button button-primary button-small"
                                onClick={() => fileInput.current?.click()}
                                disabled={photoBusy}
                            >
                                <Icon name="camera" size={16} />
                                {profile.photoUrl ? "Cambiar foto" : "Subir foto"}
                            </button>
                            {profile.photoUrl && (
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={removePhoto}
                                    disabled={photoBusy}
                                >
                                    <Icon name="trash" size={16} />
                                    Quitar foto
                                </button>
                            )}
                            <p className="profile-photo-hint">JPG, PNG o WEBP · máximo 2 MB</p>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="user" size={18} />
                            </span>
                            <div>
                                <h2>Datos personales</h2>
                                <p>Este nombre y alias se muestran dentro de la aplicación.</p>
                            </div>
                        </div>

                        <form className="form" onSubmit={saveProfile} noValidate>
                            <div className="form-grid">
                                <TextField
                                    label="Nombre"
                                    name="name"
                                    icon="user"
                                    value={form.name}
                                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                    error={formErrors.name}
                                    autoComplete="name"
                                    maxLength={80}
                                />
                                <TextField
                                    label="Alias"
                                    name="alias"
                                    icon="sparkles"
                                    value={form.alias}
                                    onChange={(event) => setForm((current) => ({ ...current, alias: event.target.value }))}
                                    error={formErrors.alias}
                                    hint="Opcional. Hasta 15 caracteres alfanuméricos."
                                    maxLength={15}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="button button-primary" disabled={saving}>
                                    {saving ? "Guardando…" : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="mail" size={18} />
                            </span>
                            <div>
                                <h2>Correo electrónico</h2>
                                <p>Tu correo actual se mantiene activo hasta que confirmes el nuevo.</p>
                            </div>
                        </div>

                        <div className="email-row">
                            <div>
                                <span className="field-inline-label">Correo actual</span>
                                <strong>{profile.email || "Sin correo registrado"}</strong>
                            </div>
                            <button
                                type="button"
                                className="button button-ghost button-small"
                                onClick={() => setEmailOpen(true)}
                                disabled={!profile.email}
                            >
                                <Icon name="edit" size={16} />
                                Cambiar correo
                            </button>
                        </div>

                        {profile.pendingEmail && (
                            <div className="notice notice-warning">
                                <span className="notice-icon">
                                    <Icon name="clock" size={19} />
                                </span>
                                <div>
                                    <strong>Cambio de correo pendiente</strong>
                                    <p>
                                        Enviamos un enlace de confirmación a <strong>{profile.pendingEmail}</strong>.
                                        {profile.emailChangeExpiresAt &&
                                            ` El enlace vence el ${formatDateTime(profile.emailChangeExpiresAt)}.`}
                                    </p>
                                    <button
                                        type="button"
                                        className="text-link"
                                        onClick={cancelEmailChange}
                                        disabled={emailBusy}
                                    >
                                        Cancelar el cambio
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="stack">
                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="info" size={18} />
                            </span>
                            <div>
                                <h2>Tu cuenta</h2>
                                <p>Información general.</p>
                            </div>
                        </div>
                        <dl className="detail-list">
                            <div>
                                <dt>Correo</dt>
                                <dd>{profile.email || "Sin registrar"}</dd>
                            </div>
                            <div>
                                <dt>Teléfono</dt>
                                <dd>{profile.phone || "Sin registrar"}</dd>
                            </div>
                            <div>
                                <dt>Estado</dt>
                                <dd>{statusLabels[profile.status] || profile.status}</dd>
                            </div>
                            <div>
                                <dt>Verificación en dos pasos</dt>
                                <dd>{profile.twoFactorEnabled ? "Activada" : "Desactivada"}</dd>
                            </div>
                            <div>
                                <dt>Cuenta creada</dt>
                                <dd>{formatDate(profile.createdAt)}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="heart" size={18} />
                            </span>
                            <div>
                                <h2>Tu actividad</h2>
                                <p>Un resumen de lo que guardaste.</p>
                            </div>
                        </div>
                        <div className="profile-stats">
                            <Link to="/favoritos">
                                <strong>{lines.length + stops.length}</strong>
                                <small>favoritos</small>
                            </Link>
                            <Link to="/historial">
                                <strong>
                                    <Icon name="history" size={18} />
                                </strong>
                                <small>historial</small>
                            </Link>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-links">
                            <Link to="/preferencias">
                                <Icon name="sliders" size={17} />
                                Preferencias
                                <Icon name="chevron-right" size={16} />
                            </Link>
                            <Link to="/seguridad">
                                <Icon name="shield" size={17} />
                                Seguridad de la cuenta
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

            <Modal
                open={emailOpen}
                onClose={() => {
                    if (!emailBusy) setEmailOpen(false)
                }}
                title="Cambiar correo electrónico"
                description="Te enviaremos un enlace de confirmación al nuevo correo. Tu correo actual seguirá activo mientras tanto."
                footer={
                    <>
                        <button
                            type="button"
                            className="button button-ghost"
                            onClick={() => setEmailOpen(false)}
                            disabled={emailBusy}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="email-change-form"
                            className="button button-primary"
                            disabled={emailBusy}
                        >
                            {emailBusy ? "Enviando…" : "Enviar enlace"}
                        </button>
                    </>
                }
            >
                <form id="email-change-form" className="form" onSubmit={requestEmailChange} noValidate>
                    <TextField
                        label="Nuevo correo electrónico"
                        name="newEmail"
                        type="email"
                        icon="mail"
                        value={emailForm.newEmail}
                        onChange={(event) =>
                            setEmailForm((current) => ({ ...current, newEmail: event.target.value }))
                        }
                        error={emailErrors.newEmail}
                        autoComplete="email"
                        placeholder="nuevo@correo.cl"
                    />
                    <PasswordField
                        label="Contraseña actual"
                        name="currentPassword"
                        value={emailForm.currentPassword}
                        onChange={(event) =>
                            setEmailForm((current) => ({ ...current, currentPassword: event.target.value }))
                        }
                        error={emailErrors.currentPassword}
                        autoComplete="current-password"
                        placeholder="Confirma que eres tú"
                    />
                    <p className="form-note">
                        <Icon name="info" size={15} />
                        Por seguridad, el cambio requiere tu contraseña actual.
                    </p>
                </form>
            </Modal>
        </div>
    )
}
