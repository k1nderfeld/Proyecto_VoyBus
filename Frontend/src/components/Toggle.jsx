export function Toggle({ checked, onChange, label, description, disabled = false }) {
    return (
        <label className={`toggle-row ${disabled ? "is-disabled" : ""}`.trim()}>
            <span className="toggle-copy">
                <span className="toggle-label">{label}</span>
                {description && <span className="toggle-description">{description}</span>}
            </span>
            <span className={`toggle ${checked ? "is-on" : ""}`.trim()}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                    disabled={disabled}
                />
                <span className="toggle-track">
                    <span className="toggle-thumb" />
                </span>
            </span>
        </label>
    )
}

export function OptionCards({ options, value, onChange, name }) {
    return (
        <div className="option-cards" role="radiogroup" aria-label={name}>
            {options.map((option) => {
                const active = value === option.value

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`option-card ${active ? "is-active" : ""}`.trim()}
                        onClick={() => onChange(option.value)}
                    >
                        <span className="option-radio" />
                        <span>{option.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
