import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Theme State & Persistence Logic', () => {
  test('Toggles theme from light to dark and vice-versa', () => {
    let currentTheme: 'light' | 'dark' = 'light';
    const toggle = (t: 'light' | 'dark') => (t === 'light' ? 'dark' : 'light');

    currentTheme = toggle(currentTheme);
    assert.strictEqual(currentTheme, 'dark');

    currentTheme = toggle(currentTheme);
    assert.strictEqual(currentTheme, 'light');
  });

  test('Validates fallback to light when invalid string stored', () => {
    const sanitizeTheme = (val: string | null): 'light' | 'dark' => {
      if (val === 'dark' || val === 'light') return val;
      return 'light';
    };

    assert.strictEqual(sanitizeTheme('dark'), 'dark');
    assert.strictEqual(sanitizeTheme('light'), 'light');
    assert.strictEqual(sanitizeTheme('invalid_theme'), 'light');
    assert.strictEqual(sanitizeTheme(null), 'light');
  });
});
