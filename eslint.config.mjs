import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '_archived/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/babel.config.js',
      '.venv/**',
      '.venv-1/**',
    ],
  },
  // Base JS recommended
  js.configs.recommended,
  // TypeScript recommended (type-aware off for speed in CI)
  ...tseslint.configs.recommended,
  // React Hooks plugin for TSX files
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Shared settings
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Unused imports — auto-fixable
      'unused-imports/no-unused-imports': 'error',
      // Unused vars (non-import) — keep the TS rule for vars/args
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      'no-unused-vars': 'off', // superseded by TS rule
      'no-case-declarations': 'error',
      'no-useless-assignment': 'error',
      'no-constant-binary-expression': 'error',
      'prefer-const': 'error',
    },
  }
);
