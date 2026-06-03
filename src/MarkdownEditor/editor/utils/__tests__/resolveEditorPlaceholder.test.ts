import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EDITOR_PLACEHOLDER,
  resolveEditorPlaceholder,
  resolveEditorPlaceholderFromProps,
} from '../resolveEditorPlaceholder';

describe('resolveEditorPlaceholder', () => {
  it('按 placeholder → textAreaProps → titlePlaceholderContent → locale → 默认 优先级解析', () => {
    expect(
      resolveEditorPlaceholder({
        placeholder: 'A',
        textAreaProps: { placeholder: 'B' },
        titlePlaceholderContent: 'C',
        localeInputPlaceholder: 'D',
      }),
    ).toBe('A');

    expect(
      resolveEditorPlaceholder({
        textAreaProps: { placeholder: 'B' },
        titlePlaceholderContent: 'C',
        localeInputPlaceholder: 'D',
      }),
    ).toBe('B');

    expect(
      resolveEditorPlaceholder({
        titlePlaceholderContent: 'C',
        localeInputPlaceholder: 'D',
      }),
    ).toBe('C');

    expect(
      resolveEditorPlaceholder({
        localeInputPlaceholder: 'D',
      }),
    ).toBe('D');

    expect(resolveEditorPlaceholder({})).toBe(DEFAULT_EDITOR_PLACEHOLDER);
  });

  it('resolveEditorPlaceholderFromProps 透传 editorProps', () => {
    expect(
      resolveEditorPlaceholderFromProps(
        {
          placeholder: 'Primary',
          textAreaProps: { placeholder: 'Secondary' },
          titlePlaceholderContent: 'Legacy',
        },
        'Locale',
      ),
    ).toBe('Primary');
  });
});
