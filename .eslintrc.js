/* eslint-env node */
module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    //sourceType: 'module',
    //jsx: true,
  },
  rules: {
    //'no-unused-vars': 1,
    'no-unused-vars': 'off',
    'no-unreachable': 'off',
    'no-var': 'warn',
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: false,
      },
    ],
  },
};
