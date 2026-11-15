import { Icon } from "./Icon"

export function PasswordChecklist({ items }) {
    return (
        <ul className="password-checks">
            {items.map((item) => (
                <li key={item.label} className={item.met ? "is-met" : ""}>
                    <span className="password-check-dot">
                        <Icon name="check" size={11} strokeWidth={3} />
                    </span>
                    {item.label}
                </li>
            ))}
        </ul>
    )
}
