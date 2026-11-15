import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { router, useNavigation, usePreventRemove } from "expo-router"
import { AppText } from "../../components/AppText"
import { Avatar } from "../../components/Avatar"
import { Badge } from "../../components/Badge"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { RequireAuth } from "../../components/RequireAuth"
import { Screen } from "../../components/Screen"
import { ScreenHeader } from "../../components/ScreenHeader"
import { Notice } from "../../components/States"
import { TextField } from "../../components/TextField"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { api } from "../../api/client"
import { askUnsavedChanges, confirmAction } from "../../lib/confirm"
import { formatDate } from "../../lib/format"
import { buildPhotoForm, pickProfilePhoto } from "../../lib/photo"
import { aliasPattern, fieldErrors, isEmail } from "../../lib/validation"

const roleLabels = { passenger: "Pasajero", driver: "Conductor", admin: "Administrador" }

// Configurar perfil (ACC-05): nombre, alias, foto con vista previa y cambio de correo verificado.
export default function ProfileScreen() {
    return (
        <RequireAuth title="Mi perfil">
            <ProfileContent />
        </RequireAuth>
    )
}

function ProfileContent() {
    const { user, isPassenger } = useAuth()

    if (!isPassenger) return <ReadOnlyProfile user={user} />

    return <EditableProfile />
}

// Conductores y administradores: sus datos los administra la empresa (el backend no les permite editarlos).
function ReadOnlyProfile({ user }) {
    return (
        <Screen>
            <ScreenHeader title="Mi perfil" fallback="/perfil" />
            <Card>
                <View style={styles.identity}>
                    <Avatar user={user} size={72} />
                    <View style={styles.flex}>
                        <AppText variant="subtitle">{user.name}</AppText>
                        <AppText variant="caption" tone="muted">
                            {user.email || user.phone}
                        </AppText>
                        <Badge label={roleLabels[user.role] ?? user.role} />
                    </View>
                </View>
            </Card>
            <Notice tone="info">Los datos de las cuentas de conductor y administrador los gestiona la empresa.</Notice>
        </Screen>
    )
}

function EditableProfile() {
    const { user, updateUser } = useAuth()
    const toast = useToast()
    const navigation = useNavigation()

    const [form, setForm] = useState({ name: user.name ?? "", alias: user.alias ?? "" })
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const [preview, setPreview] = useState(null)
    const [photoBusy, setPhotoBusy] = useState(false)

    const [emailOpen, setEmailOpen] = useState(false)
    const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" })
    const [emailErrors, setEmailErrors] = useState({})
    const [emailError, setEmailError] = useState(null)
    const [emailBusy, setEmailBusy] = useState(false)
    const [leaveAction, setLeaveAction] = useState(null)

    const profileDirty = form.name.trim() !== (user.name ?? "") || (form.alias.trim() || null) !== (user.alias || null)
    const dirty = profileDirty || Boolean(preview)

    const saveProfile = async () => {
        const nextErrors = {}
        const name = form.name.trim()
        const alias = form.alias.trim()

        if (name.length < 2 || name.length > 80) nextErrors.name = "El nombre debe tener entre 2 y 80 caracteres."
        if (alias && !aliasPattern.test(alias)) {
            nextErrors.alias = "Usa hasta 15 letras o números, sin espacios ni símbolos."
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return false
        }

        setSaving(true)
        setErrors({})

        try {
            const response = await api.patch("/users/me", { name, alias: alias || null })
            updateUser(response.data)
            setForm({ name: response.data.name, alias: response.data.alias ?? "" })
            toast.success(response.message)
            return true
        } catch (requestError) {
            const fields = fieldErrors(requestError)
            // El alias repetido llega como 409 con un mensaje general.
            if (requestError.status === 409) fields.alias = requestError.message
            setErrors(fields)
            if (!Object.keys(fields).length) toast.error(requestError.message)
            return false
        } finally {
            setSaving(false)
        }
    }

    const choosePhoto = async (source) => {
        try {
            const asset = await pickProfilePhoto(source)
            if (asset) setPreview(asset)
        } catch (pickError) {
            toast.error(pickError.message)
        }
    }

    const savePhoto = async () => {
        setPhotoBusy(true)

        try {
            const response = await api.put("/users/me/photo", await buildPhotoForm(preview), { form: true })
            updateUser(response.data)
            setPreview(null)
            toast.success(response.message)
            return true
        } catch (requestError) {
            toast.error(requestError.message)
            return false
        } finally {
            setPhotoBusy(false)
        }
    }

    const removePhoto = async () => {
        const confirmed = await confirmAction({
            title: "Quitar foto",
            message: "Se mostrarán tus iniciales en lugar de la foto.",
            confirmLabel: "Quitar",
            destructive: true
        })

        if (!confirmed) return

        setPhotoBusy(true)

        try {
            const response = await api.delete("/users/me/photo")
            updateUser(response.data)
            toast.success(response.message)
        } catch (requestError) {
            toast.error(requestError.message)
        } finally {
            setPhotoBusy(false)
        }
    }

    // Si se intenta salir con cambios pendientes, se ofrece guardarlos o descartarlos (ACC-05).
    // Para salir, primero se desactiva el aviso (leaveAction) y después se repite la navegación:
    // si se repitiera con el aviso activo, volvería a preguntar.
    usePreventRemove(dirty && !leaveAction, async ({ data }) => {
        const choice = await askUnsavedChanges()

        if (choice === "discard") {
            setLeaveAction(data.action)
            return
        }

        if (choice === "save") {
            const profileSaved = profileDirty ? await saveProfile() : true
            const photoSaved = preview ? await savePhoto() : true
            if (profileSaved && photoSaved) setLeaveAction(data.action)
        }
    })

    useEffect(() => {
        if (leaveAction) navigation.dispatch(leaveAction)
    }, [leaveAction, navigation])

    const requestEmailChange = async () => {
        const nextErrors = {}
        const newEmail = emailForm.newEmail.trim()

        if (!isEmail(newEmail)) nextErrors.newEmail = "Ingresa un correo electrónico válido."
        if (!emailForm.currentPassword) nextErrors.currentPassword = "Ingresa tu contraseña actual."

        if (Object.keys(nextErrors).length) {
            setEmailErrors(nextErrors)
            return
        }

        setEmailBusy(true)
        setEmailErrors({})
        setEmailError(null)

        try {
            const response = await api.post("/users/me/email-change", {
                newEmail,
                currentPassword: emailForm.currentPassword
            })
            updateUser({ ...user, pendingEmail: response.data.pendingEmail })
            setEmailForm({ newEmail: "", currentPassword: "" })
            setEmailOpen(false)
            toast.success(response.message)
        } catch (requestError) {
            const fields = fieldErrors(requestError)
            setEmailErrors(fields)
            if (!Object.keys(fields).length) setEmailError(requestError.message)
        } finally {
            setEmailBusy(false)
        }
    }

    const cancelEmailChange = async () => {
        setEmailBusy(true)

        try {
            const response = await api.delete("/users/me/email-change")
            updateUser(response.data)
            toast.success(response.message)
        } catch (requestError) {
            toast.error(requestError.message)
        } finally {
            setEmailBusy(false)
        }
    }

    return (
        <Screen>
            <ScreenHeader title="Mi perfil" fallback="/perfil" />

            {/* Foto de perfil con vista previa antes de guardar */}
            <Card>
                <View style={styles.identity}>
                    <Avatar user={user} uri={preview?.uri} size={84} />
                    <View style={styles.flex}>
                        <AppText variant="subtitle">{user.name}</AppText>
                        <AppText variant="caption" tone="muted">
                            {user.alias ? `@${user.alias}` : "Sin alias"}
                        </AppText>
                        {preview && <Badge label="Vista previa sin guardar" tone="warning" />}
                    </View>
                </View>

                {preview ? (
                    <View style={styles.row}>
                        <Button title="Guardar foto" icon="checkmark" onPress={savePhoto} loading={photoBusy} style={styles.grow} />
                        <Button title="Cancelar" variant="secondary" onPress={() => setPreview(null)} disabled={photoBusy} style={styles.grow} />
                    </View>
                ) : (
                    <>
                        <View style={styles.row}>
                            <Button title="Galería" icon="images-outline" variant="secondary" onPress={() => choosePhoto("library")} style={styles.grow} />
                            <Button title="Cámara" icon="camera-outline" variant="secondary" onPress={() => choosePhoto("camera")} style={styles.grow} />
                        </View>
                        {user.photoUrl && (
                            <Button title="Quitar foto" variant="ghost" onPress={removePhoto} loading={photoBusy} />
                        )}
                    </>
                )}
                <AppText variant="caption" tone="muted">
                    JPG, PNG o WEBP de hasta 2 MB.
                </AppText>
            </Card>

            {/* Nombre y alias */}
            <Card>
                <AppText variant="subtitle">Datos personales</AppText>
                <TextField
                    label="Nombre"
                    icon="person-outline"
                    value={form.name}
                    onChangeText={(name) => setForm((current) => ({ ...current, name }))}
                    error={errors.name}
                    autoComplete="name"
                />
                <TextField
                    label="Alias (opcional)"
                    icon="at-outline"
                    value={form.alias}
                    onChangeText={(alias) => setForm((current) => ({ ...current, alias }))}
                    error={errors.alias}
                    hint="Hasta 15 letras o números, sin espacios. Debe ser único."
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={15}
                />
                <Button title="Guardar cambios" onPress={saveProfile} loading={saving} disabled={!profileDirty} />
            </Card>

            {/* Correo: el nuevo se verifica antes de reemplazar al actual */}
            <Card>
                <AppText variant="subtitle">Correo electrónico</AppText>
                <AppText tone="soft">{user.email || "Sin correo registrado"}</AppText>

                {user.pendingEmail && (
                    <Notice tone="warning" title="Confirmación pendiente">
                        <AppText variant="caption" tone="soft">
                            Enviamos un enlace a {user.pendingEmail}. Tu correo actual sigue activo hasta que lo confirmes.
                        </AppText>
                        <View style={[styles.row, styles.noticeActions]}>
                            <Button title="Tengo el enlace" size="sm" variant="secondary" onPress={() => router.push("/confirm-email")} />
                            <Button title="Cancelar cambio" size="sm" variant="ghost" onPress={cancelEmailChange} loading={emailBusy} />
                        </View>
                    </Notice>
                )}

                {emailOpen ? (
                    <View style={styles.form}>
                        {emailError && <Notice tone="danger">{emailError}</Notice>}
                        <TextField
                            label="Nuevo correo"
                            icon="mail-outline"
                            placeholder="nuevo@correo.cl"
                            value={emailForm.newEmail}
                            onChangeText={(newEmail) => setEmailForm((current) => ({ ...current, newEmail }))}
                            error={emailErrors.newEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                        <TextField
                            label="Contraseña actual"
                            icon="lock-closed-outline"
                            hint="Para confirmar que eres tú."
                            value={emailForm.currentPassword}
                            onChangeText={(currentPassword) => setEmailForm((current) => ({ ...current, currentPassword }))}
                            error={emailErrors.currentPassword}
                            secure
                            autoCapitalize="none"
                        />
                        <View style={styles.row}>
                            <Button title="Enviar enlace" onPress={requestEmailChange} loading={emailBusy} style={styles.grow} />
                            <Button
                                title="Cancelar"
                                variant="secondary"
                                onPress={() => {
                                    setEmailOpen(false)
                                    setEmailErrors({})
                                    setEmailError(null)
                                }}
                                style={styles.grow}
                            />
                        </View>
                    </View>
                ) : (
                    <Button title="Cambiar correo" icon="mail-outline" variant="secondary" onPress={() => setEmailOpen(true)} />
                )}
            </Card>

            <Card>
                <AppText variant="subtitle">Tu cuenta</AppText>
                <InfoRow label="Teléfono" value={user.phone || "Sin registrar"} />
                <InfoRow label="Tipo de cuenta" value={roleLabels[user.role] ?? user.role} />
                <InfoRow label="Cuenta creada" value={formatDate(user.createdAt)} />
            </Card>
        </Screen>
    )
}

function InfoRow({ label, value }) {
    return (
        <View style={styles.info}>
            <AppText variant="caption" tone="muted">
                {label}
            </AppText>
            <AppText variant="label">{value}</AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    identity: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    flex: {
        flex: 1,
        gap: 4
    },
    row: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap"
    },
    grow: {
        flexGrow: 1
    },
    form: {
        gap: 12
    },
    noticeActions: {
        marginTop: 8
    },
    info: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12
    }
})
