module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,

  // Line wrapping
  printWidth: 100,
  endOfLine: 'lf',

  // JSX specific
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // Object and array formatting
  bracketSpacing: true,
  arrowParens: 'always',

  // File specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: ['*.tsx', '*.jsx'],
      options: {
        jsxBracketSameLine: false,
      },
    },
  ],
};
