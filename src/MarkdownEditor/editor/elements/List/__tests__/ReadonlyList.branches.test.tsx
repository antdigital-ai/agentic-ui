/**
 * ReadonlyList：ordered vs unordered tag 分支。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyList } from '../ReadonlyList';

describe('ReadonlyList branches', () => {
  it('numbered-list 渲染 ol，bulleted-list 渲染 ul', () => {
    const { rerender, container } = render(
      <ConfigProvider>
        <ReadonlyList
          attributes={{ 'data-slate-node': 'element' } as any}
          element={{ type: 'numbered-list', children: [] } as any}
        >
          <li>1</li>
        </ReadonlyList>
      </ConfigProvider>,
    );
    expect(container.querySelector('ol')).toBeTruthy();

    rerender(
      <ConfigProvider>
        <ReadonlyList
          attributes={{ 'data-slate-node': 'element' } as any}
          element={{ type: 'bulleted-list', children: [] } as any}
        >
          <li>1</li>
        </ReadonlyList>
      </ConfigProvider>,
    );
    expect(container.querySelector('ul')).toBeTruthy();
  });
});
