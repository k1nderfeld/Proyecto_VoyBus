import { useId } from "react"
import { Icon } from "./Icon"

export function SearchBar({ value, onChange, placeholder = "Buscar", onSubmit, autoFocus = false, children, ariaLabel = "Buscar" }) {
    const id = useId()

    const form = (
        <div className="search-bar">
            <span className="search-icon">
                <Icon name="search" size={19} />
            </span>
            <label className="sr-only" htmlFor={id}>
                {ariaLabel}
            </label>
            <input
                id={id}
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                autoComplete="off"
            />
            {value && (
                <button type="button" className="search-clear" onClick={() => onChange("")} aria-label="Limpiar búsqueda">
                    <Icon name="close" size={16} />
                </button>
            )}
            {children}
        </div>
    )

    if (!onSubmit) return form

    return (
        <form
            className="search-form"
            role="search"
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
            }}
        >
            {form}
        </form>
    )
}
