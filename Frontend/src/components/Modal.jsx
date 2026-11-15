import { useEffect, useId } from "react"
import { createPortal } from "react-dom"
import { Icon } from "./Icon"

export function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
    const titleId = useId()

    useEffect(() => {
        if (!open) return

        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose()
        }

        document.addEventListener("keydown", onKeyDown)
        document.body.classList.add("modal-open")

        return () => {
            document.removeEventListener("keydown", onKeyDown)
            document.body.classList.remove("modal-open")
        }
    }, [open, onClose])

    if (!open) return null

    return createPortal(
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <div className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <header className="modal-header">
                    <div>
                        <h2 id={titleId}>{title}</h2>
                        {description && <p>{description}</p>}
                    </div>
                    <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
                        <Icon name="close" size={19} />
                    </button>
                </header>
                <div className="modal-body">{children}</div>
                {footer && <footer className="modal-footer">{footer}</footer>}
            </div>
        </div>,
        document.body
    )
}
