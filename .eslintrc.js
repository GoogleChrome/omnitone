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
  overrides: [
    {
      // Build-time Node scripts, not shipped to the browser.
      files: ['src/resources/build-hrir-base64.js'],
      env: {
        browser: false,
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      // The test runner loads specs as ES modules, so they are strict mode.
      // Linting them catches implicit globals that silently "worked" back when
      // the suite was served as sloppy-mode classic scripts.
      files: ['test/**/*.js'],
      env: {
        mocha: true,
      },
      globals: {
        AudioBus: 'readonly',
        Omnitone: 'readonly',
        OmnitoneFOAHrirBase64: 'readonly',
        OmnitoneSOAHrirBase64: 'readonly',
        OmnitoneTOAHrirBase64: 'readonly',
        assert: 'readonly',
        chai: 'readonly',
        createConstantBuffer: 'readonly',
        createImpulseBuffer: 'readonly',
        expect: 'readonly',
        getDualBandFilterCoefs: 'readonly',
        isConstantValueOf: 'readonly',
        should: 'readonly',
      },
      rules: {
        // Shared helpers in test-setup.js are consumed by sibling spec files,
        // so they look unused to a per-file linter.
        'no-unused-vars': 'off',
        // Audio expectations are written as full-precision literals on
        // purpose; rounding them would weaken the assertions.
        'no-loss-of-precision': 'off',
      },
    },
  ],
};
