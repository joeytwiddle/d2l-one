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
    'no-unused-vars': 0,
    'no-unreachable': 'warn',
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
