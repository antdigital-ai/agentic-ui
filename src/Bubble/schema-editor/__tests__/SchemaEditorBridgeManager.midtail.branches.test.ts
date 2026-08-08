/**
 * SchemaEditorBridgeManager midtail：单例、enable/register/unregister、getContent。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createBridge = vi.fn(() => ({
  dispose: vi.fn(),
}));

vi.mock('@schema-element-editor/host-sdk/core', () => ({
  createSchemaElementEditorBridge: (...args: any[]) => createBridge(...args),
}));

vi.mock('../../MarkdownEditor', () => ({
  MarkdownEditor: () => null,
}));

describe('SchemaEditorBridgeManager midtail branches', () => {
  let Manager: typeof import('../SchemaEditorBridgeManager').SchemaEditorBridgeManager;

  beforeEach(async () => {
    vi.resetModules();
    createBridge.mockClear();
    ({ SchemaEditorBridgeManager: Manager } = await import(
      '../SchemaEditorBridgeManager'
    ));
  });

  afterEach(() => {
    const inst = Manager.getInstance();
    inst.setEnabled(false);
    // drain registry if any leftover ids
    ['a', 'b', 'c'].forEach((id) => {
      if (inst.has(id)) inst.unregister(id);
    });
  });

  it('getInstance 单例；disabled register 不 start；enable 后 start', () => {
    const a = Manager.getInstance();
    const b = Manager.getInstance();
    expect(a).toBe(b);
    expect(a.isEnabled()).toBe(false);

    a.register('a', {
      getContent: () => 'hello',
      setContent: vi.fn(),
    });
    expect(a.getRegistrySize()).toBe(1);
    expect(a.has('a')).toBe(true);
    expect(a.getContentById('a')).toBe('hello');
    expect(a.getContentById('missing')).toBeUndefined();
    expect(createBridge).not.toHaveBeenCalled();

    a.setEnabled(true);
    expect(a.isEnabled()).toBe(true);
    expect(createBridge).toHaveBeenCalledTimes(1);

    // 幂等 start：再 register 不重复 create
    a.register('b', {
      getContent: () => 'b',
      setContent: vi.fn(),
    });
    expect(createBridge).toHaveBeenCalledTimes(1);

    a.setEnabled(false);
    expect(a.isEnabled()).toBe(false);

    a.unregister('a');
    a.unregister('b');
    expect(a.getRegistrySize()).toBe(0);
  });

  it('先 enable 再 register 立即 start；清空 registry stop', () => {
    const m = Manager.getInstance();
    m.setEnabled(true);
    // 空 registry enable 不 start
    expect(createBridge).not.toHaveBeenCalled();

    m.register('c', {
      getContent: () => 'c',
      setContent: vi.fn(),
    });
    expect(createBridge).toHaveBeenCalledTimes(1);

    m.unregister('c');
    expect(m.getRegistrySize()).toBe(0);
  });
});
