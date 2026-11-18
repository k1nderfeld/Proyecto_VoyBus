export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const phonePattern = /^\+?[1-9]\d{7,14}$/
export const aliasPattern = /^[A-Za-z0-9]{1,15}$/

export const isEmail = (value) => emailPattern.test(value.trim())

export const isPhone = (value) => phonePattern.test(value.trim())

export const passwordChecks = (value) => ({
    length: value.length >= 8 && value.length <= 15,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value)
})

export const isValidPassword = (value) => Object.values(passwordChecks(value)).every(Boolean)

export const newPasswordChecks = (value) => ({
    length: value.length >= 8 && value.length <= 72,
    letter: /[A-Za-z]/.test(value),
    number: /\d/.test(value)
})

export const isValidNewPassword = (value) => Object.values(newPasswordChecks(value)).every(Boolean)

export const fieldErrors = (error) => {
    const result = {}

    if (Array.isArray(error?.data?.errors)) {
        error.data.errors.forEach((item) => {
            if (item?.field && !result[item.field]) result[item.field] = item.message
        })
    }

    return result
}
