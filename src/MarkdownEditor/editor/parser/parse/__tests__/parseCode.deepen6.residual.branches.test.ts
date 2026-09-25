/**
 * parseCode deepen6：value undefined → || '{}'/'[]'、mermaid loading、
 * config 空 keys vs 有 keys、result 无 otherProps debug 臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCode, handleYaml } from '../parseCode';

describe('parseCode deepen6 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('agentic/schema：value undefined → || "{}" / "[]"', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const agentic = handleCode({
      value: undefined as any,
      lang: 'agentic-ui-task',
    });
    expect(agentic.type).toBe('agentic-ui-task');

    const schema = handleCode({
      value: undefined as any,
      lang: 'schema',
    });
    expect(schema.type).toBe('apaasify');
    spy.mockRestore();
  });

  it('mermaid：有换行但不完整 → loading else 臂', () => {
    const r = handleCode({
      value: 'graph TD\nA-->',
      lang: 'mermaid',
    });
    expect(r.type).toBe('mermaid');
    expect(r.otherProps?.finished).toBe(false);
  });

  it('仅 config 空对象 vs 有键；yaml value undefined', () => {
    const emptyCfg = handleCode(
      { value: 'print(1)\n', lang: 'python' },
      {},
    );
    expect(emptyCfg.otherProps?.finished).toBe(false);

    const withCfg = handleCode(
      { value: 'print(2)\n', lang: 'python' },
      { theme: 'light', mark: true },
    );
    expect(withCfg.otherProps).toMatchObject({ theme: 'light' });

    const yaml = handleYaml({ value: undefined as any });
    expect(yaml.type).toBe('code');
  });

  it('无 otherProps 的 code：debug otherPropsKeys 空数组臂', () => {
    const r = handleCode({ value: 'x', lang: 'unknown-lang-xyz' });
    expect(r.type).toBe('code');
    expect(r.otherProps === null || r.otherProps === undefined || typeof r.otherProps === 'object').toBe(true);
  });
});
