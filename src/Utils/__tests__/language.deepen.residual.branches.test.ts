/**
 * language deepen：antd locale 含 en 返回 en-US。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectAntdLocale } from '../language';

describe('language deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
  });

  it('data-antd-locale 含 en 时返回 en-US', () => {
    const el = document.createElement('div');
    el.setAttribute('data-antd-locale', 'en_US');
    document.body.appendChild(el);
    expect(detectAntdLocale()).toBe('en-US');
  });
});
