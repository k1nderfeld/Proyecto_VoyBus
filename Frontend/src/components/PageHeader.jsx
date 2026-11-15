import { Link } from "react-router-dom"
import { Icon } from "./Icon"

export function PageHeader({ eyebrow, title, description, actions, backTo, backLabel = "Volver" }) {
    return (
        <header className="page-head">
            {backTo && (
                <Link className="back-link" to={backTo}>
                    <Icon name="arrow-left" size={16} />
                    <span>{backLabel}</span>
                </Link>
            )}
            <div className="page-head-row">
                <div className="page-head-copy">
                    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                    <h1>{title}</h1>
                    {description && <p className="page-description">{description}</p>}
                </div>
                {actions && <div className="page-actions">{actions}</div>}
            </div>
        </header>
    )
}

export function SectionHeader({ title, description, action, icon }) {
    return (
        <div className="section-head">
            <div className="section-head-copy">
                {icon && (
                    <span className="section-icon">
                        <Icon name={icon} size={18} />
                    </span>
                )}
                <div>
                    <h2>{title}</h2>
                    {description && <p>{description}</p>}
                </div>
            </div>
            {action}
        </div>
    )
}
