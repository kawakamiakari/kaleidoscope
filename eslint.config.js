// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist', 'docs'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  { languageOptions: { globals: globals.browser } },
  prettier,
);
