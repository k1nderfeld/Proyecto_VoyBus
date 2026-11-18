// Linter del proyecto (RNF-06). Uso: npm run lint
const { defineConfig } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")

module.exports = defineConfig([
    expoConfig,
    {
        ignores: ["dist/*", ".expo/*"]
    },
    {
        // Scripts que corren con Node (fuera de la app).
        files: ["scripts/**/*.js", "*.config.js"],
        languageOptions: {
            globals: {
                __dirname: "readonly",
                require: "readonly",
                module: "writable",
                process: "readonly",
                console: "readonly",
                Buffer: "readonly"
            }
        }
    }
])
