/**
 * Workspace TaskList：switch success 分支。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { TaskList } from '../index';

describe('TaskList branches', () => {
  it('status success 渲染成功图标容器', () => {
    const { container } = render(
      <ConfigProvider>
        <TaskList
          data={{
            items: [{ key: '1', title: 'Done', status: 'success' }],
          }}
        />
      </ConfigProvider>,
    );
    expect(container.querySelector('[class*="-item-success"]')).toBeTruthy();
  });
});
