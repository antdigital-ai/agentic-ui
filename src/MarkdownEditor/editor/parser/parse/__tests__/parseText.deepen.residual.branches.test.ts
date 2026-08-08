/**
 * parseText deepen：code / finished 格式保留、directive 空 children、pure inline。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleTextAndInlineElementsPure,
  parseText,
} from '../parseText';

describe('parseText deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('hasFormattingProps：code / finished=false 空 strong 保留空文本', () => {
    const withCode = parseText([{ type: 'strong', children: [] } as any], {
      data: {},
      code: true,
    } as any);
    expect(withCode.some((l) => l.code && l.text === '')).toBe(true);

    const withFinished = parseText(
      [{ type: 'strong', children: [] } as any],
      {
        data: {},
        otherProps: { finished: false },
      } as any,
    );
    expect(
      withFinished.some(
        (l) => l.otherProps?.finished === false && l.text === '',
      ),
    ).toBe(true);
  });

  it('textDirective / leafDirective 无 children；有格式时补空文本', () => {
    const empty = parseText([
      { type: 'textDirective', name: 'x' } as any,
      { type: 'leafDirective', name: 'y' } as any,
    ]);
    expect(Array.isArray(empty)).toBe(true);

    const formatted = parseText([{ type: 'textDirective' } as any], {
      data: {},
      bold: true,
    } as any);
    expect(formatted.some((l) => l.bold && l.text === '')).toBe(true);
  });

  it('handleTextAndInlineElementsPure：directive 无 children；link 无 children', () => {
    const parseNodes = vi.fn(() => []);
    const applyInline = (leaf: any) => leaf;

    expect(
      handleTextAndInlineElementsPure(
        { type: 'textDirective' },
        [],
        applyInline,
        parseNodes,
      ),
    ).toEqual({ text: '' });

    const linkResult = handleTextAndInlineElementsPure(
      { type: 'link', url: 'https://a.test' },
      [],
      applyInline,
      parseNodes,
    );
    expect(Array.isArray(linkResult)).toBe(true);
  });
});
