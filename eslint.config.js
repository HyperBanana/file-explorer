import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    prettierConfig,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                node: 'readonly',
            },
        },
        files: ['**/*.js', '**/*.vue'],
    },
];
