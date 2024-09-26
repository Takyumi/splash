// eslint.config.mjs
export default {
  // Use the TypeScript parser for .ts and .tsx files
  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2020, // Allows the use of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },

  plugins: ['@typescript-eslint'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Uses TypeScript's recommended rules
  ],

  overrides: [
    {
      files: ['*.ts', '*.tsx'], // Apply these rules to TypeScript files only
      rules: {
        // Customize any rules here
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],

  env: {
    browser: true, // Allows browser globals like window and document
    node: true, // Allows Node.js globals like module and process
    es6: true, // Allows ECMAScript 6 features
  },
};
