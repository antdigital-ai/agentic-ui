/**
 * parseCode deepen3：value 空串 || '{}'/'[]'、mermaid 无换行 loading、
 * handler 无 otherProps 合并、仅 config 臂、debug otherPropsKeys 空。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCode, handleYaml } from '../parseCode';

describe('parseCode deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('agentic/schema：value 空 → || "{}" / "[]"', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const agentic = handleCode({ value: '', lang: 'agentic-ui-task' });
    expect(agentic.type).toBe('agentic-ui-task');

    const schema = handleCode({ value: '', lang: 'schema' });
    expect(schema.type).toBe('apaasify');
    spy.mockRestore();
  });

  it('mermaid 无换行结尾 → stream loading（else 臂）', () => {
    const r = handleCode({ value: 'graph TD', lang: 'mermaid' });
    expect(r.type).toBe('mermaid');
    expect(r.otherProps?.finished).toBe(false);
  });

  it('mermaid handler 无 otherProps：base.otherProps 合并进去', () => {
    const r = handleCode(
      {
        value: 'graph TD\nA-->B\n',
        lang: 'mermaid',
        otherProps: { finished: false, mark: 1 },
      },
      { fromConfig: true },
    );
    expect(r.otherProps).toBeTruthy();
    expect(r.otherProps?.mark === 1 || r.otherProps?.fromConfig).toBeTruthy();
  });

  it('无 handler + 空 config：不进入 config 合并；yaml', () => {
    const plain = handleCode({ value: 'x = 1\n', lang: 'python' });
    expect(plain.type).toBe('code');
    expect(plain.otherProps?.finished).toBeUndefined();

    const onlyEmptyCfg = handleCode(
      { value: 'print(1)', lang: 'python' },
      {},
    );
    expect(onlyEmptyCfg.otherProps?.finished).toBe(false);

    const yaml = handleYaml({ value: 'a: 1' });
    expect(yaml.type).toBe('code');
  });

  it('仅 config（无 base/result otherProps 路径）+ 完成态', () => {
    const r = handleCode(
      { value: 'console.log(1)\n', lang: 'javascript' },
      { theme: 'dark' },
    );
    expect(r.otherProps).toMatchObject({ theme: 'dark' });
  });
});
