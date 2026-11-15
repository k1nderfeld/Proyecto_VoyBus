const icons = {
    home: (
        <>
            <path d="M3.5 10.7 12 3.5l8.5 7.2V20a1.5 1.5 0 0 1-1.5 1.5h-4.2v-6.2H9.2v6.2H5A1.5 1.5 0 0 1 3.5 20z" />
        </>
    ),
    bus: (
        <>
            <rect x="4" y="3.5" width="16" height="14.5" rx="3" />
            <path d="M4 11h16" />
            <path d="M8 21v-3M16 21v-3" />
            <path d="M8 14.5h.01M16 14.5h.01" />
        </>
    ),
    pin: (
        <>
            <path d="M20 10.2c0 5.8-8 10.8-8 10.8s-8-5-8-10.8a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.7" />
        </>
    ),
    heart: (
        <>
            <path d="M20.7 4.7a5.4 5.4 0 0 0-7.7 0L12 5.8l-1-1.1a5.4 5.4 0 1 0-7.7 7.7l1.1 1.1L12 21l7.6-7.5 1.1-1.1a5.4 5.4 0 0 0 0-7.7Z" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
    ),
    history: (
        <>
            <path d="M3 12a9 9 0 1 0 2.8-6.5M3 3.5V8h4.5" />
            <path d="M12 7.5V12l3 1.8" />
        </>
    ),
    sliders: (
        <>
            <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
            <circle cx="15" cy="7" r="2.2" />
            <circle cx="9" cy="17" r="2.2" />
        </>
    ),
    shield: (
        <>
            <path d="M12 3 5 5.8v5.4c0 4.3 3 8.3 7 9.8 4-1.5 7-5.5 7-9.8V5.8z" />
            <path d="m9.2 11.8 2 2 3.6-3.8" />
        </>
    ),
    logout: (
        <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 16 4-4-4-4M20 12H9" />
        </>
    ),
    link: (
        <>
            <path d="M10.5 13.5a5 5 0 0 0 7.1 0l2.2-2.2a5 5 0 0 0-7.1-7.1L11.5 5.4" />
            <path d="M13.5 10.5a5 5 0 0 0-7.1 0l-2.2 2.2a5 5 0 0 0 7.1 7.1l1.2-1.2" />
        </>
    ),
    flag: (
        <>
            <path d="M5 21V4" />
            <path d="M5 4h11l-1.6 4L16 12H5" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </>
    ),
    "arrow-right": (
        <>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </>
    ),
    "arrow-left": (
        <>
            <path d="M19 12H5M11 6l-6 6 6 6" />
        </>
    ),
    "chevron-down": (
        <>
            <path d="m6 9 6 6 6-6" />
        </>
    ),
    "chevron-left": (
        <>
            <path d="m14.5 5-7 7 7 7" />
        </>
    ),
    "chevron-right": (
        <>
            <path d="m9.5 5 7 7-7 7" />
        </>
    ),
    close: (
        <>
            <path d="m6 6 12 12M18 6 6 18" />
        </>
    ),
    check: (
        <>
            <path d="m5 12.5 4.2 4.2L19 7" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5V12l3 1.8" />
        </>
    ),
    calendar: (
        <>
            <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
        </>
    ),
    route: (
        <>
            <circle cx="6" cy="19" r="2.4" />
            <circle cx="18" cy="5" r="2.4" />
            <path d="M8.4 19H15a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h6.6" />
        </>
    ),
    swap: (
        <>
            <path d="M7 4 3 8l4 4M3 8h18M17 20l4-4-4-4M21 16H3" />
        </>
    ),
    camera: (
        <>
            <path d="M4 8h3l1.6-2.3h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13.2" r="3.4" />
        </>
    ),
    trash: (
        <>
            <path d="M4 7h16M9.5 7V4h5v3M6.5 7l.9 13.5h9.2L17.5 7" />
            <path d="M10 11v6M14 11v6" />
        </>
    ),
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m3.5 7 8.5 6 8.5-6" />
        </>
    ),
    lock: (
        <>
            <rect x="4" y="10" width="16" height="11" rx="3" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="15.5" r="1.1" />
        </>
    ),
    eye: (
        <>
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    "eye-off": (
        <>
            <path d="M4 4l16 16" />
            <path d="M9.9 5.9A9.5 9.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.2 4M6.3 8.2A17.4 17.4 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.2-.6" />
            <path d="M10 10a3 3 0 0 0 4 4" />
        </>
    ),
    star: (
        <>
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z" />
        </>
    ),
    external: (
        <>
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 7.7h.01" />
        </>
    ),
    alert: (
        <>
            <path d="M12 3.8 21 20H3z" />
            <path d="M12 9v4.5M12 17h.01" />
        </>
    ),
    sparkles: (
        <>
            <path d="m12 3 1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9z" />
            <path d="M18.5 15.5 19 17l1.5.5-1.5.5-.5 1.5-.5-1.5L16.5 17l1.5-.5z" />
        </>
    ),
    locate: (
        <>
            <circle cx="12" cy="12" r="6.5" />
            <circle cx="12" cy="12" r="2" />
            <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
        </>
    ),
    list: (
        <>
            <path d="M9 6h11M9 12h11M9 18h11" />
            <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
        </>
    ),
    grid: (
        <>
            <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
            <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
        </>
    ),
    plus: (
        <>
            <path d="M12 5v14M5 12h14" />
        </>
    ),
    phone: (
        <>
            <path d="M6.2 3.5h2.9l1.7 4.3-2.2 1.5a12.5 12.5 0 0 0 5.8 5.8l1.5-2.2 4.3 1.7v2.9a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
        </>
    ),
    qr: (
        <>
            <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
            <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
            <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
            <path d="M14.5 14.5h3v3M20.5 20.5h.01M14.5 20.5h3M20.5 14.5v3" />
        </>
    ),
    moon: (
        <>
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
        </>
    ),
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
        </>
    ),
    monitor: (
        <>
            <rect x="3" y="4" width="18" height="12" rx="2.5" />
            <path d="M8 20h8M12 16v4" />
        </>
    ),
    bell: (
        <>
            <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
        </>
    ),
    refresh: (
        <>
            <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1M20.5 3.5V9H15" />
        </>
    ),
    maximize: (
        <>
            <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
        </>
    ),
    edit: (
        <>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </>
    ),
    "arrow-up-right": (
        <>
            <path d="M7 17 17 7M8 7h9v9" />
        </>
    )
}

export function Icon({ name, size = 20, strokeWidth = 1.8, className = "" }) {
    return (
        <svg
            className={`icon ${className}`.trim()}
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {icons[name] || icons.info}
        </svg>
    )
}
