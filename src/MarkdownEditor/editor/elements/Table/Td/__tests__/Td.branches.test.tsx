/**
 * Td：错误 element type 抛错分支。
 */
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Td } from '../index';

describe('Td branches', () => {
  it('element.type 非 table-cell 时抛错', () => {
    expect(() =>
      render(
        <ConfigProvider>
          <table>
            <tbody>
              <tr>
                <Td
                  attributes={{} as any}
                  element={{ type: 'paragraph', children: [] } as any}
                >
                  x
                </Td>
              </tr>
            </tbody>
          </table>
        </ConfigProvider>,
      ),
    ).toThrow('Element "Td" must be of type "table-cell"');
  });
});
