import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../api/client"
import { Icon } from "../components/Icon"
import { PageHeader } from "../components/PageHeader"
import { EmptyState, ErrorState, Skeleton } from "../components/States"
import { Toggle } from "../components/Toggle"
import { useToast } from "../context/ToastContext"
import { useApiData } from "../hooks/useApiData"
import { formatRelative } from "../lib/format"
import { applyTheme } from "../lib/theme"

const groupIcons = {
    general: "sliders",
    notifications: "bell",
    privacy: "shield"
}

const themeIcons = {
    light: "sun",
    dark: "moon",
    system: "monitor"
}

const editable = (source) => ({
    language: source.language,
    theme: source.theme,
    showExplicitContent: source.showExplicitContent,
    notifications: { ...source.notifications },
    privacy: { ...source.privacy }
})

const readPath = (source, path) => path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), source)

export function PreferencesPage() {
    const { success, error } = useToast()
    const [values, setValues] = useState(null)
    const [baseline, setBaseline] = useState(null)
    const [saving, setSaving] = useState(false)

    const optionsState = useApiData(
        ({ signal }) => api.get("/users/preferences/options", { signal }).then((response) => response.data),
        []
    )

    const preferencesState = useApiData(
        ({ signal }) => api.get("/users/me/preferences", { signal }).then((response) => response.data),
        []
    )

    useEffect(() => {
        if (!preferencesState.data) return
        setValues(preferencesState.data)
        setBaseline(preferencesState.data)
        applyTheme(preferencesState.data.theme)
        document.documentElement.lang = preferencesState.data.language || "es"
    }, [preferencesState.data])

    const groups = optionsState.data || []
    const dirty = useMemo(() => {
        if (!values || !baseline) return false
        return JSON.stringify(editable(values)) !== JSON.stringify(editable(baseline))
    }, [values, baseline])

    const setPreference = (path, value) => {
        setValues((current) => {
            const next = JSON.parse(JSON.stringify(current))
            const keys = path.split(".")
            let target = next

            keys.slice(0, -1).forEach((key) => {
                target[key] = target[key] || {}
                target = target[key]
            })

            target[keys[keys.length - 1]] = value
            return next
        })

        if (path === "theme") applyTheme(value)
        if (path === "language") document.documentElement.lang = value
    }

    const save = async () => {
        if (!values) return

        setSaving(true)

        try {
            const response = await api.patch("/users/me/preferences", editable(values))
            setValues(response.data)
            setBaseline(response.data)
            applyTheme(response.data.theme)
            success("Preferencias actualizadas correctamente.")
        } catch (requestError) {
            error(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    const reset = () => {
        if (!baseline) return
        setValues(baseline)
        applyTheme(baseline.theme)
        document.documentElement.lang = baseline.language || "es"
    }

    if (optionsState.loading || preferencesState.loading) {
        return (
            <div className="page">
                <PageHeader eyebrow="Mi cuenta" title="Preferencias" />
                <div className="settings-layout">
                    <div className="stack">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="settings-skeleton" />
                        ))}
                    </div>
                    <Skeleton className="settings-skeleton" />
                </div>
            </div>
        )
    }

    if (optionsState.error) {
        return (
            <div className="page">
                <PageHeader eyebrow="Mi cuenta" title="Preferencias" />
                <ErrorState message={optionsState.error} onRetry={optionsState.reload} />
            </div>
        )
    }

    if (preferencesState.error) {
        return (
            <div className="page">
                <PageHeader eyebrow="Mi cuenta" title="Preferencias" />
                <ErrorState message={preferencesState.error} onRetry={preferencesState.reload} />
            </div>
        )
    }

    if (!values || !groups.length) {
        return (
            <div className="page">
                <PageHeader eyebrow="Mi cuenta" title="Preferencias" />
                <EmptyState
                    icon="sliders"
                    title="No hay preferencias disponibles"
                    description="Cuando la aplicación publique opciones de configuración aparecerán aquí."
                />
            </div>
        )
    }

    const notificationOptions = groups.find((group) => group.key === "notifications")?.preferences || []
    const activeNotifications = notificationOptions.filter((definition) => readPath(values, definition.path)).length
    const themeOption = groups
        .find((group) => group.key === "general")
        ?.preferences.find((definition) => definition.key === "theme")
        ?.options.find((option) => option.value === values.theme)
    const languageOption = groups
        .find((group) => group.key === "general")
        ?.preferences.find((definition) => definition.key === "language")
        ?.options.find((option) => option.value === values.language)

    return (
        <div className="page">
            <PageHeader
                eyebrow="Mi cuenta"
                title="Preferencias"
                description="Ajusta el idioma, la apariencia y los avisos que quieres recibir en la aplicación."
            />

            <div className="settings-layout">
                <div className="settings-main">
                    {groups.map((group) => (
                        <section className="panel settings-group" key={group.key}>
                            <div className="panel-head">
                                <span className="panel-icon">
                                    <Icon name={groupIcons[group.key] || "sliders"} size={18} />
                                </span>
                                <div>
                                    <h2>{group.label}</h2>
                                    <p>{group.description}</p>
                                </div>
                            </div>

                            <div className="settings-list">
                                {group.preferences.map((definition) => {
                                    const value = readPath(values, definition.path)

                                    if (definition.key === "theme") {
                                        return (
                                            <div className="setting-row setting-row-stacked" key={definition.key}>
                                                <div className="setting-copy">
                                                    <strong>{definition.label}</strong>
                                                    <p>{definition.description}</p>
                                                </div>
                                                <div className="theme-picker" role="radiogroup" aria-label={definition.label}>
                                                    {definition.options.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            role="radio"
                                                            aria-checked={value === option.value}
                                                            className={`theme-option ${value === option.value ? "is-active" : ""}`.trim()}
                                                            onClick={() => setPreference(definition.path, option.value)}
                                                        >
                                                            <span className="theme-option-icon">
                                                                <Icon name={themeIcons[option.value] || "monitor"} size={18} />
                                                            </span>
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }

                                    if (definition.type === "enum") {
                                        return (
                                            <div className="setting-row" key={definition.key}>
                                                <div className="setting-copy">
                                                    <strong>{definition.label}</strong>
                                                    <p>{definition.description}</p>
                                                </div>
                                                <div className="select-shell select-shell-compact">
                                                    <select
                                                        value={value || ""}
                                                        onChange={(event) =>
                                                            setPreference(definition.path, event.target.value)
                                                        }
                                                        aria-label={definition.label}
                                                    >
                                                        {definition.options.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Icon name="chevron-down" size={17} />
                                                </div>
                                            </div>
                                        )
                                    }

                                    return (
                                        <Toggle
                                            key={definition.key}
                                            label={definition.label}
                                            description={definition.description}
                                            checked={Boolean(value)}
                                            onChange={(next) => setPreference(definition.path, next)}
                                        />
                                    )
                                })}
                            </div>
                        </section>
                    ))}

                    <div className="settings-actions">
                        <span className={`settings-state ${dirty ? "is-dirty" : ""}`.trim()}>
                            <Icon name={dirty ? "info" : "check"} size={16} />
                            {dirty ? "Tienes cambios sin guardar" : "Todo está guardado"}
                        </span>
                        <div className="settings-actions-buttons">
                            <button
                                type="button"
                                className="button button-ghost"
                                onClick={reset}
                                disabled={!dirty || saving}
                            >
                                Descartar
                            </button>
                            <button
                                type="button"
                                className="button button-primary"
                                onClick={save}
                                disabled={!dirty || saving}
                            >
                                {saving ? "Guardando…" : "Guardar preferencias"}
                            </button>
                        </div>
                    </div>
                </div>

                <aside className="stack">
                    <section className="panel">
                        <div className="panel-head">
                            <span className="panel-icon">
                                <Icon name="monitor" size={18} />
                            </span>
                            <div>
                                <h2>Resumen</h2>
                                <p>Así queda configurada tu cuenta.</p>
                            </div>
                        </div>
                        <dl className="detail-list">
                            <div>
                                <dt>Tema</dt>
                                <dd>{themeOption?.label || "Automático"}</dd>
                            </div>
                            <div>
                                <dt>Idioma</dt>
                                <dd>{languageOption?.label || "Español"}</dd>
                            </div>
                            <div>
                                <dt>Avisos activos</dt>
                                <dd>
                                    {activeNotifications} de {notificationOptions.length}
                                </dd>
                            </div>
                            <div>
                                <dt>Última actualización</dt>
                                <dd>{baseline?.updatedAt ? formatRelative(baseline.updatedAt) : "Sin registro"}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="panel tip-panel">
                        <span className="tip-icon">
                            <Icon name="bell" size={20} />
                        </span>
                        <h3>Avisos a tu medida</h3>
                        <p>Activa solo los avisos que te resulten útiles. Puedes cambiarlos cuando quieras.</p>
                    </section>

                    <section className="panel">
                        <div className="panel-links">
                            <Link to="/seguridad">
                                <Icon name="shield" size={17} />
                                Seguridad de la cuenta
                                <Icon name="chevron-right" size={16} />
                            </Link>
                            <Link to="/perfil">
                                <Icon name="user" size={17} />
                                Editar mi perfil
                                <Icon name="chevron-right" size={16} />
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}
