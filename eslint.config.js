const babelParser = require('@babel/eslint-parser')

module.exports = {
  files: ['**/*.js'],
  rules: {
    'no-unused-vars': 'error',
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'never']
  },
  languageOptions: {
    parser: babelParser
  },
  ignores: [
    'node_modules/',
    'build/',
    'dist/',
    '*.config.js'
  ]
}
