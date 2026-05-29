const globals = {
  console: 'readonly',
  URL: 'readonly',
  structuredClone: 'readonly',
  document: 'readonly',
  window: 'readonly',
  chrome: 'readonly',
  setInterval: 'readonly',
  fetch: 'readonly',
  require: 'readonly',
  module: 'readonly',
  process: 'readonly',
  __dirname: 'readonly',
  Buffer: 'readonly'
};

module.exports = [
  {
    files: ['src/**/*.js', 'browser-extension/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      semi: ['error', 'always']
    }
  }
];
