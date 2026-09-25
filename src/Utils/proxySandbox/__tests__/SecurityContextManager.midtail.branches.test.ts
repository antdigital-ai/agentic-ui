/**
 * SecurityContextManager midtail：create / run / permission 配置。
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  createSecurityContextManager,
  runInSecureContext,
  SecurityContextManager,
} from '../SecurityContextManager';

describe('SecurityContextManager midtail branches', () => {
  const managers: SecurityContextManager[] = [];

  afterEach(() => {
    while (managers.length) {
      managers.pop()?.destroy();
    }
  });

  it('createContext + executeInContext', async () => {
    const m = createSecurityContextManager();
    managers.push(m);
    const id = m.createContext();
    const result = await m.executeInContext(id, 'return 1+1');
    expect(result.success).toBe(true);
    expect(result.result).toBe(2);
  });

  it('runInSecureContext 便捷执行', async () => {
    const result = await runInSecureContext('return 3*3');
    expect(result.success).toBe(true);
    expect(result.result).toBe(9);
  });

  it('network 权限关闭配置仍可执行纯计算', async () => {
    const m = createSecurityContextManager({
      permissions: {
        network: false,
        fileSystem: false,
        media: false,
        geolocation: false,
        notifications: false,
      },
    });
    managers.push(m);
    const id = m.createContext();
    const result = await m.executeInContext(id, 'return typeof fetch');
    expect(result.success).toBe(true);
  });
});
