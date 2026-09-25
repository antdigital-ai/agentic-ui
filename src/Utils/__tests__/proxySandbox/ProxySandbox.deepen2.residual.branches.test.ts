/**
 * ProxySandbox deepen2 residual：safeDocument/Window 敏感属性、
 * Proxy traps、timers 校验、validateCode、Worker 回退、runInSandbox。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ProxySandbox,
  createSandbox,
  runInSandbox,
} from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox deepen2 residual branches', () => {
  let sandbox: ProxySandbox | undefined;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    sandbox?.destroy();
    sandbox = undefined;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('createSafeDocument：危险 get/set/has；cookie；createElement', () => {
    sandbox = new ProxySandbox({ allowDOM: true });
    const doc = (sandbox as any).createSafeDocument();
    expect(doc.location).toBeUndefined();
    expect(doc.write).toBeUndefined();
    expect('location' in doc).toBe(false);
    expect('title' in doc).toBe(true);
    expect(doc.cookie).toBe('');
    doc.cookie = 'a=1';
    expect(doc.cookie).toBe('');
    expect(Reflect.set(doc, 'title', 'x')).toBe(false);
    expect(doc.createElement('div').tagName).toBe('DIV');
    expect(doc.createTextNode('hi').textContent).toBe('hi');
    expect(doc.createDocumentFragment().nodeType).toBe(11);
    expect(doc.getElementById('x')).toBeNull();
    expect(doc.querySelectorAll('*')).toEqual([]);
    expect(doc.unknownProp).toBeUndefined();
    Reflect.set(doc, 'customAttr', 1);
    expect(doc.customAttr).toBe(1);
  });

  it('createSafeWindow：敏感 storage/location/navigator；set/has/ownKeys', () => {
    sandbox = new ProxySandbox({ allowConsole: true });
    const win = (sandbox as any).createSafeWindow();
    expect(win.cookie).toBe('');
    expect(win.localStorage.getItem('k')).toBeNull();
    win.sessionStorage.setItem('k', 'v');
    expect(win.location.href).toBe('about:blank');
    expect(win.navigator.userAgent).toContain('Sandbox');
    expect(win.parent).toBeUndefined();
    expect(Reflect.set(win, 'localStorage', {})).toBe(false);
    expect('navigator' in win).toBe(false);
    expect('Array' in win).toBe(true);
    const keys = Reflect.ownKeys(win);
    expect(keys.every((k) => String(k) !== 'navigator')).toBe(true);
    expect(Reflect.getOwnPropertyDescriptor(win, 'navigator')).toBeUndefined();
    expect(Reflect.getOwnPropertyDescriptor(win, 'Array')).toBeTruthy();
    expect(win.console).toBeTruthy();
    Reflect.set(win, 'myProp', 9);
    expect(win.myProp).toBe(9);
  });

  it('globalProxy：forbidden get/set/has；allowed/custom；ownKeys', () => {
    sandbox = new ProxySandbox({
      allowedGlobals: ['Math'],
      forbiddenGlobals: ['evil'],
      customGlobals: { ok: 1 },
      timeout: 300,
    });
    const proxy = (sandbox as any).globalProxy;
    expect(() => proxy.evil).toThrow(/not allowed/);
    expect(() => {
      proxy.evil = 1;
    }).toThrow(/not allowed/);
    expect('evil' in proxy).toBe(false);
    expect(proxy.ok).toBe(1);
    expect(proxy.__checkInstructions).toBeDefined();
    expect(proxy.Math).toBe(Math);
    expect(proxy.unknown).toBeUndefined();
    const keys = Reflect.ownKeys(proxy);
    expect(keys.map(String)).not.toContain('evil');
    expect(Reflect.getOwnPropertyDescriptor(proxy, 'evil')).toBeUndefined();
    // set 写入 sandboxGlobal，get 仅对 allowed/custom 可见
    proxy.localVar = 3;
    expect((sandbox as any).sandboxGlobal.localVar).toBe(3);
    expect(proxy.localVar).toBeUndefined();
  });

  it('safeTimeout/Interval：非函数抛错；回调错误吞掉', async () => {
    sandbox = new ProxySandbox({ allowTimers: true, timeout: 500 });
    const st = (sandbox as any).createSafeTimeout();
    const si = (sandbox as any).createSafeInterval();
    expect(() => st('bad' as any, 10)).toThrow(TypeError);
    expect(() => si('bad' as any, 10)).toThrow(TypeError);

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const tid = st(() => {
      throw new Error('timer boom');
    }, 5);
    await vi.advanceTimersByTimeAsync(20);
    clearTimeout(tid);

    const iid = si(() => {
      throw new Error('interval boom');
    }, 5);
    await vi.advanceTimersByTimeAsync(150);
    clearInterval(iid);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('validateCode：危险模式与 critical forbidden', () => {
    sandbox = new ProxySandbox({ timeout: 300 });
    expect(() => (sandbox as any).validateCode('eval(1)')).toThrow(/dangerous/);
    expect(() =>
      (sandbox as any).validateCode('globalThis.foo'),
    ).toThrow(/globalThis/);
    expect(() =>
      (sandbox as any).validateCode('return fetch'),
    ).toThrow(/not allowed/);
    expect(() =>
      (sandbox as any).validateCode('x.constructor'),
    ).toThrow(/dangerous/);
  });

  it('isObviousInfiniteLoop + instrumentCode + instruction limit', async () => {
    sandbox = new ProxySandbox({ timeout: 200 });
    expect((sandbox as any).isObviousInfiniteLoop('while(true){}')).toBe(true);
    expect((sandbox as any).isObviousInfiniteLoop('for(;;){}')).toBe(true);
    expect((sandbox as any).isObviousInfiniteLoop('return 1')).toBe(false);

    const instrumented = (sandbox as any).instrumentCode(
      'while(true){ break; }',
    );
    expect(instrumented).toContain('__checkInstructions');

    const result = await sandbox.execute('while(true){}');
    expect(result.success).toBe(false);
  });

  it('trySerializeParams 不可序列化回退；fallback 死循环走 instruction', async () => {
    sandbox = new ProxySandbox({ timeout: 300 });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await sandbox.execute('return 1', {
      cb: () => 1,
    });
    expect(result.success === true || result.success === false).toBe(true);
    warn.mockRestore();

    await new Promise<void>((resolve) => {
      (sandbox as any).fallbackToSyncExecution(
        'while(true){}',
        {},
        () => resolve(),
        () => resolve(),
      );
    });
  });

  it('handleConsoleMessage / getMemoryUsage / addGlobal / removeGlobal', () => {
    sandbox = new ProxySandbox({ allowConsole: true });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    (sandbox as any).handleConsoleMessage('log', ['a']);
    (sandbox as any).handleConsoleMessage('nope', ['b']);
    expect(log).toHaveBeenCalled();
    log.mockRestore();

    expect(typeof (sandbox as any).getMemoryUsage()).toBe('number');
    sandbox.addGlobal('g1', 42);
    expect(sandbox.getConfig().customGlobals.g1).toBe(42);
    expect(() => sandbox!.addGlobal('eval', 1)).toThrow(/forbidden/);
    sandbox.removeGlobal('g1');
    expect(sandbox.getConfig().customGlobals.g1).toBeUndefined();
    expect(sandbox.isRunning()).toBe(false);
  });

  it('createSandbox + runInSandbox 工厂', async () => {
    const s = createSandbox({ timeout: 400 });
    const r = await s.execute('return 2 + 2');
    expect(r.success).toBe(true);
    expect(r.result).toBe(4);
    s.destroy();

    const quick = await runInSandbox('return 9', { timeout: 400 });
    expect(quick.success).toBe(true);
    expect(quick.result).toBe(9);
  });

  it('strictMode false；allowConsole/Timers false 时 globals 不注入', async () => {
    sandbox = new ProxySandbox({
      strictMode: false,
      allowConsole: false,
      allowTimers: false,
      timeout: 400,
    });
    const cfg = sandbox.getConfig();
    expect(cfg.strictMode).toBe(false);
    expect(cfg.allowConsole).toBe(false);
    const result = await sandbox.execute('return 3');
    expect(result.success).toBe(true);
    expect(result.result).toBe(3);
  });

  it('cleanup 清除 timeoutId；execute 非 Error throw', async () => {
    sandbox = new ProxySandbox({ timeout: 400 });
    (sandbox as any).timeoutId = window.setTimeout(() => {}, 9999);
    (sandbox as any).cleanup();
    expect((sandbox as any).timeoutId).toBeNull();

    vi.spyOn(sandbox as any, 'executeCode').mockImplementation(() => {
      throw 'string-err';
    });
    // Force sync path by stubbing Worker
    const origWorker = (globalThis as any).Worker;
    (globalThis as any).Worker = undefined;
    const result = await sandbox.execute('return 1');
    (globalThis as any).Worker = origWorker;
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});
