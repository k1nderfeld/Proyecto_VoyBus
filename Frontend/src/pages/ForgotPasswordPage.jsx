import { useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../api/client"
import { AuthShell } from "../components/AuthShell"
import { TextField } from "../components/Fields"
import { Icon } from "../components/Icon"
import { useToast } from "../context/ToastContext"
import { isEmail } from "../lib/validation"

export function ForgotPasswordPage() {
    const { success, error } = useToast()
    const [email, setEmail] = useState("")
    const [fieldError, setFieldError] = useState(null)
    const [sent, setSent] = useState(false)
    const [sending, setSending] = useState(false)

    const submit = async (event) => {
        event.preventDefault()

        if (!isEmail(email)) {
            setFieldError("Ingresa un correo electrónico válido.")
            return
        }

        setSending(true)
        setFieldError(null)

        try {
            const response = await api.post("/auth/forgot-password", { email: email.trim() }, { auth: false })
            setSent(true)
            success(response.message)
        } catch (requestError) {
            error(requestError.message)
        } finally {
            setSending(false)
        }
    }

    const resend = async () => {
        setSending(true)

        try {
            const response = await api.post("/auth/forgot-password", { email: email.trim() }, { auth: false })
            success(response.message)
        } catch (requestError) {
            error(requestError.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <AuthShell
            title={sent ? "Revisa tu correo" : "Recupera tu contraseña"}
            description={
                sent
                    ? "Enviamos las instrucciones para restablecer tu contraseña."
                    : "Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para crear una nueva contraseña."
            }
            footer={
                <p>
                    <Link to="/login">Volver a iniciar sesión</Link>
                </p>
            }
        >
            {sent ? (
                <div className="auth-result">
                    <span className="auth-result-icon">
                        <Icon name="mail" size={30} />
                    </span>
                    <h3>El enlace va en camino</h3>
                    <p>
                        Si <strong>{email.trim()}</strong> está registrado en VoyBus, recibirás un mensaje con las
                        instrucciones. El enlace vence en 15 minutos.
                    </p>
                    <div className="auth-result-actions">
                        <Link className="button button-primary button-block" to="/login">
                            Volver a iniciar sesión
                        </Link>
                        <button
                            type="button"
                            className="button button-ghost button-block"
                            onClick={resend}
                            disabled={sending}
                        >
                            {sending ? "Reenviando…" : "Reenviar instrucciones"}
                        </button>
                    </div>
                    <p className="auth-fineprint">
                        <Icon name="info" size={14} />
                        Revisa también la carpeta de correo no deseado.
                    </p>
                </div>
            ) : (
                <form className="form auth-form" onSubmit={submit} noValidate>
                    <TextField
                        label="Correo electrónico"
                        name="email"
                        type="email"
                        icon="mail"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value)
                            if (fieldError) setFieldError(null)
                        }}
                        error={fieldError}
                        autoComplete="email"
                        placeholder="tu@correo.cl"
                        autoFocus
                    />

                    <button type="submit" className="button button-primary button-block" disabled={sending}>
                        {sending ? "Enviando…" : "Enviar instrucciones"}
                    </button>
                </form>
            )}

            <Link className="auth-back" to="/login">
                <Icon name="arrow-left" size={15} />
                Volver a iniciar sesión
            </Link>
        </AuthShell>
    )
}
