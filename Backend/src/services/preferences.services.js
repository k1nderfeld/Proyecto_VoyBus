const UserPreference = require("../models/userPreference")
const { preferenceGroups, preferenceDefinitions, preferencePath } = require("../config/preferences")

const readPath = (data, path) =>
    path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), data)

class PreferencesService {
    async getPreferences(userId) {
        const preference = await this.findOrCreate(userId)
        return this.toResponse(preference)
    }

    async updatePreferences(userId, data) {
        const preference = await this.findOrCreate(userId)
        const changes = {}

        for (const definition of preferenceDefinitions) {
            const value = readPath(data, preferencePath(definition))
            if (value !== undefined) {
                changes[definition.column] = value
            }
        }

        await preference.update(changes)
        return this.toResponse(preference)
    }

    getOptions() {
        return Object.entries(preferenceGroups).map(([groupKey, group]) => ({
            key: groupKey,
            label: group.label,
            description: group.description,
            preferences: preferenceDefinitions
                .filter((definition) => definition.group === groupKey)
                .map((definition) => ({
                    key: definition.key,
                    path: preferencePath(definition),
                    type: definition.type,
                    label: definition.label,
                    description: definition.description,
                    defaultValue: definition.defaultValue,
                    ...(definition.options && { options: definition.options })
                }))
        }))
    }

    // Las preferencias se crean con valores por defecto la primera vez que se consultan.
    async findOrCreate(userId) {
        const [preference] = await UserPreference.findOrCreate({ where: { userId } })
        return preference
    }

    toResponse(preference) {
        const response = {}

        for (const definition of preferenceDefinitions) {
            const value = preference.get(definition.column)

            if (definition.group === "general") {
                response[definition.key] = value
            } else {
                response[definition.group] = response[definition.group] || {}
                response[definition.group][definition.key] = value
            }
        }

        response.updatedAt = preference.updatedAt
        return response
    }
}

module.exports = new PreferencesService()
