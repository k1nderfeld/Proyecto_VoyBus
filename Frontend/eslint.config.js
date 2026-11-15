// Linter del proyecto (RNF-06). Uso: npm run lint
const { defineConfig } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")

module.exports = defineConfig([
    expoConfig,
    {
        ignores: ["dist/*", ".expo/*"]
    }
])
