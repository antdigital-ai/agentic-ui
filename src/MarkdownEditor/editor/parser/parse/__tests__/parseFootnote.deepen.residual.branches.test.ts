/**
 * parseFootnote deepen：children.text 缺省走 `?? ''`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

import { legacyFootnoteReferenceElementToTextLeaf } from '../parseFootnote';

describe('parseFootnote deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 identifier/text 时从 children 空 text 拼接', () => {
    const leaf = legacyFootnoteReferenceElementToTextLeaf({
      children: [{}, { text: undefined }],
    });
    expect(leaf.fnc).toBe(true);
    expect(leaf.text).toBe('');
  });
});
