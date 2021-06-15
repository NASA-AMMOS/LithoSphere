module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '.git',
        '<rootDir>/dist/',
    ],
    transformIgnorePatterns: ['<rootDir>/node_modules/', '\\.pnp\\.[^\\/]+$'],
    setupFiles: ['jest-canvas-mock'],
    automock: false,
}
