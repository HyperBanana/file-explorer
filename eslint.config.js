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
        rules: {
            // You can add your custom rules here, for example:
            // 'vue/no-unused-vars': 'error'
        },
        // This applies these settings to both .js and .vue files
        files: ['**/*.js', '**/*.vue'],
    },
];
