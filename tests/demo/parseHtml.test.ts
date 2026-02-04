import { docxDeserializer } from '@ant-design/agentic-ui';
import { afterEach, describe, expect, it } from 'vitest';

import { html, rtl } from './word';

describe('word parse', () => {
  afterEach(async () => {
    // 确保测试结束后清理所有异步操作
    // 等待所有待处理的异步操作完成
    await new Promise((resolve) => {
      // 给一个短暂的时间让所有异步操作完成
      setTimeout(resolve, 10);
    });
  });

  it('docxDeserializer', () => {
    const fragment = docxDeserializer(rtl, html);
    expect(fragment).toMatchSnapshot();
  });
});
