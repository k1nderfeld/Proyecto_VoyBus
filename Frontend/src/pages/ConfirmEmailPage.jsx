import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "../api/client"
import { AuthShell } from "../components/AuthShell"
import { Icon } from "../components/Icon"
import { Loader } from "../components/States"
import { useAuth } from "../context/AuthContext"

export function ConfirmEmailPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token") || ""
    const tokenValid = /^[a-f0-9]{64}$/i.test(token)
    const { user, refresh } = useAuth()
    const started = useRef(false)
    const [state, setState] = useState({
        status: tokenValid ? "loading" : "invalid",
        email: null,
        message: null
    })

    const confirm = async () => {
        setState({ status: "loading", email: null, message: null })

        try {
            const response = await api.post("/users/email-change/confirm", { token }, { auth: false })
            setState({ status: "success", email: response.data?.email || null, message: response.message })
            if (user) await refresh().catch(() => {})
        } catch (requestError) {
            setState({ status: "error", email: null, message: requestError.message })
        }
    }

    useEffect(() => {
        if (started.current || !tokenValid) return
        started.current = true
        confirm()
    }, [tokenValid])

    if (state.status === "loading") {
        return (
            <AuthShell
                title="Confirmando tu correo"
                description="Estamos validando el enlace. Esto tomará solo un momento."
            >
                <div className="auth-loading">
                    <Loader label="Confirmando el cambio de correo" />
                </div>
            </AuthShell>
        )
    }

    if (state.status === "success") {
        return (
            <AuthShell
                title="Correo confirmado"
                description="Tu nuevo correo electrónico ya está activo en VoyBus."
                footer={
                    <p>
                        <Link to="/">Ir al inicio</Link>
                    </p>
                }
            >
                <div className="auth-result">
                    <span className="auth-result-icon">
                        <Icon name="check" size={30} />
                    </span>
                    <h3>Todo quedó actualizado</h3>
                    <p>
                        {state.email ? (
                            <>
                                Ahora puedes iniciar sesión y recibir avisos en <strong>{state.email}</strong>.
                            </>
                        ) : (
                            "El correo de tu cuenta quedó actualizado correctamente."
                        )}
                    </p>
                    <div className="auth-result-actions">
                        {user ? (
                            <Link className="button button-primary button-block" to="/perfil">
                                Revisar mi perfil
                            </Link>
                        ) : (
                            <Link className="button button-primary button-block" to="/login">
                                Iniciar sesión
                            </Link>
                        )}
                        <Link className="button button-ghost button-block" to="/">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </AuthShell>
        )
    }

    const invalid = state.status === "invalid"

    return (
        <AuthShell
            title={invalid ? "El enlace no es válido" : "No pudimos confirmar el correo"}
            description={
                invalid
                    ? "El enlace de confirmación está incompleto o ya no es válido."
                    : "El enlace puede haber vencido o ya fue utilizado."
            }
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
                <h3>{invalid ? "Enlace incompleto" : "El enlace expiró"}</h3>
                <p>
                    {invalid
                        ? "Abre el enlace directamente desde el correo que te enviamos."
                        : state.message || "Solicita un nuevo cambio de correo desde tu perfil."}
                </p>
                <div className="auth-result-actions">
                    {user ? (
                        <Link className="button button-primary button-block" to="/perfil">
                            Ir a mi perfil
                        </Link>
                    ) : (
                        <Link className="button button-primary button-block" to="/login">
                            Iniciar sesión
                        </Link>
                    )}
                    <Link className="button button-ghost button-block" to="/">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </AuthShell>
    )
}
