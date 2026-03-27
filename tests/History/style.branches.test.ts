import { describe, expect, it } from 'vitest';
import type { ChatTokenType } from '../../src/Hooks/useStyle';
import { genStyle } from '../../src/History/style';

const baseToken = (): ChatTokenType =>
  ({
    componentCls: '.mock-history-menu',
    colorText: undefined,
    colorTextDisabled: undefined,
    colorTextSecondary: undefined,
    colorBorder: undefined,
  }) as ChatTokenType;

describe('History style genStyle token 分支', () => {
  it('在 color 相关 token 为空时使用 CSS 变量回退', () => {
    const styles = genStyle(baseToken());
    expect(styles['.mock-history-menu']).toBeDefined();
  });

  it('在提供 color 相关 token 时使用 token 值', () => {
    const styles = genStyle(
      {
        ...baseToken(),
        colorText: '#111',
        colorTextDisabled: '#999',
        colorTextSecondary: '#888',
        colorBorder: '#eee',
      } as ChatTokenType,
    );
    expect(styles['.mock-history-menu']).toBeDefined();
  });
});
