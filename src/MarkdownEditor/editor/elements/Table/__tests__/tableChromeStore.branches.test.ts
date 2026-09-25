import { describe, expect, it, vi } from 'vitest';
import { createTableChromeStore } from '../tableChromeStore';

describe('tableChromeStore 分支覆盖', () => {
  it('setPosition 相同引用不通知 listener', () => {
    const store = createTableChromeStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const pos = { rowIndex: 1, columnIndex: 2 };
    store.setPosition(pos);
    store.setPosition(pos);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('setPosition null/null 相等不通知', () => {
    const store = createTableChromeStore(null);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setPosition(null);
    expect(listener).not.toHaveBeenCalled();
  });

  it('setPosition 相同 row/col 不通知', () => {
    const store = createTableChromeStore({ rowIndex: 0, columnIndex: 1 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setPosition({ rowIndex: 0, columnIndex: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('setPosition 不同位置时通知 listener', () => {
    const store = createTableChromeStore({ rowIndex: 0, columnIndex: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setPosition({ rowIndex: 1, columnIndex: 0 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual({ rowIndex: 1, columnIndex: 0 });
  });
});
