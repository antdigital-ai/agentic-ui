import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { HistoryEmpty } from '../../../src/History/components/HistoryEmpty';
import { I18nContext } from '../../../src/I18n';

describe('HistoryEmpty', () => {
  it('应渲染默认标题和描述', () => {
    render(
      <I18nContext.Provider value={{ locale: undefined } as any}>
        <HistoryEmpty />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('找不到相关结果')).toBeInTheDocument();
    expect(screen.getByText('换个关键词试试吧')).toBeInTheDocument();
  });

  it('应使用 locale 中的标题和描述', () => {
    render(
      <I18nContext.Provider
        value={{
          locale: {
            'chat.history.empty.chat.title': '空状态标题',
            'chat.history.empty.chat.description': '空状态描述',
          },
        } as any}
      >
        <HistoryEmpty />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('空状态标题')).toBeInTheDocument();
    expect(screen.getByText('空状态描述')).toBeInTheDocument();
  });
});
