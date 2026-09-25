/**
 * parser constants residual：directive 规范化与时间保护（围栏/行内代码）。
 */
import { describe, expect, it } from 'vitest';
import {
  preprocessNormalizeLeafToContainerDirective,
  preprocessProtectTimeFromDirective,
} from '../constants';

describe('parser/constants residual branches', () => {
  it('空串早退', () => {
    expect(preprocessNormalizeLeafToContainerDirective('')).toBe('');
    expect(preprocessProtectTimeFromDirective('')).toBe('');
    expect(preprocessNormalizeLeafToContainerDirective(null as any)).toBe(
      null,
    );
  });

  it('::name / :: 关闭行规范化；围栏内跳过', () => {
    const md = ['::note', 'body', '::', '```', '::skip', '```', 'after'].join(
      '\n',
    );
    const out = preprocessNormalizeLeafToContainerDirective(md);
    expect(out).toContain(':::note');
    expect(out).toContain(':::');
    expect(out).toMatch(/```\n::skip\n```/);
  });

  it('时间冒号转义；行内代码与围栏内不污染', () => {
    const md = [
      'time 02:20:31',
      'code `a:1` end',
      '```',
      'keep:22',
      '```',
      'https://example.com/x',
    ].join('\n');
    const out = preprocessProtectTimeFromDirective(md);
    expect(out).toContain('\\:20');
    expect(out).toContain('`a:1`');
    expect(out).toMatch(/```\nkeep:22\n```/);
    expect(out).toContain('https://example.com/x');
  });

  it('未闭合行内反引号整段原样保留', () => {
    const out = preprocessProtectTimeFromDirective('start `open:99');
    expect(out).toContain('`open:99');
  });
});
