/**
 * SchemaEditorBridgeManager deepen：单例 register/unregister 与 enabled 开关。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SchemaEditorBridgeManager from '../SchemaEditorBridgeManager';

describe('SchemaEditorBridgeManager deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('register/unregister 与 setEnabled 分支', () => {
    const manager = SchemaEditorBridgeManager.getInstance();
    const handler = {
      getContent: () => 'x',
      setContent: vi.fn(),
    };
    manager.setEnabled(false);
    expect(manager.isEnabled()).toBe(false);
    manager.register('b1', handler);
    manager.setEnabled(true);
    expect(manager.isEnabled()).toBe(true);
    manager.unregister('b1');
    manager.setEnabled(false);
  });
});
