import { useId, useState } from "react"
import { Icon } from "./Icon"

export function Field({ label, hint, error, htmlFor, children, className = "" }) {
    return (
        <div className={`field ${error ? "has-error" : ""} ${className}`.trim()}>
            {label && <label htmlFor={htmlFor}>{label}</label>}
            {children}
            {error ? (
                <p className="field-error">{error}</p>
            ) : hint ? (
                <p className="field-hint">{hint}</p>
            ) : null}
        </div>
    )
}

export function TextField({ label, hint, error, icon, trailing, className = "", ...props }) {
    const generatedId = useId()
    const inputId = props.id || `${props.name || "field"}-${generatedId}`

    return (
        <Field label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
            <div className={`input-shell ${icon ? "has-icon" : ""} ${trailing ? "has-trailing" : ""}`.trim()}>
                {icon && (
                    <span className="input-icon">
                        <Icon name={icon} size={18} />
                    </span>
                )}
                <input id={inputId} {...props} aria-invalid={Boolean(error)} />
                {trailing && <span className="input-trailing">{trailing}</span>}
            </div>
        </Field>
    )
}

export function PasswordField({ label, hint, error, className = "", ...props }) {
    const [visible, setVisible] = useState(false)
    const generatedId = useId()
    const inputId = props.id || `${props.name || "password"}-${generatedId}`

    return (
        <Field label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
            <div className="input-shell has-icon has-trailing">
                <span className="input-icon">
                    <Icon name="lock" size={18} />
                </span>
                <input id={inputId} type={visible ? "text" : "password"} {...props} aria-invalid={Boolean(error)} />
                <span className="input-trailing">
                    <button
                        type="button"
                        className="input-action"
                        onClick={() => setVisible((current) => !current)}
                        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        <Icon name={visible ? "eye-off" : "eye"} size={18} />
                    </button>
                </span>
            </div>
        </Field>
    )
}

export function SelectField({ label, hint, error, children, className = "", ...props }) {
    const generatedId = useId()
    const selectId = props.id || `${props.name || "select"}-${generatedId}`

    return (
        <Field label={label} hint={hint} error={error} htmlFor={selectId} className={className}>
            <div className="select-shell">
                <select id={selectId} {...props} aria-invalid={Boolean(error)}>
                    {children}
                </select>
                <Icon name="chevron-down" size={17} />
            </div>
        </Field>
    )
}

export function CheckboxField({ label, description, error, ...props }) {
    return (
        <div className={`checkbox-field ${error ? "has-error" : ""}`.trim()}>
            <label className="checkbox-label">
                <input type="checkbox" {...props} />
                <span className="checkbox-box">
                    <Icon name="check" size={13} strokeWidth={2.6} />
                </span>
                <span>
                    {label}
                    {description && <small>{description}</small>}
                </span>
            </label>
            {error && <p className="field-error">{error}</p>}
        </div>
    )
}
