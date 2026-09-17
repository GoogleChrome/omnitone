module.exports = {
  env: {
    es6: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  rules: {
    'max-len': ['error', {code: 80, ignoreUrls: true}],
    'no-unused-vars': ['error', {args: 'none', caughtErrors: 'none'}],
  },
};
