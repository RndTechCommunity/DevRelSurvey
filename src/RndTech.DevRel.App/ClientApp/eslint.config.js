import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
    js.configs.recommended,
    tseslint.configs.recommended,
    reactHooks.configs.flat.recommended
)
