module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['test/**/*', 'src/secondary/**/*'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/ts-expect-error': 'allow-with-description'
        'no-var': 2,
        'no-useless-constructor': 2,
        'no-duplicate-imports': 2,
        'prefer-arrow-callback': 2,
        'prefer-const': 2,
        'no-invalid-this': 0,
        'no-loop-func': 2,
        'arrow-body-style': 2,
    },
}
