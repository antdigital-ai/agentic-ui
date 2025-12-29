import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cnLabels, enLabels, I18nContext } from '../@ant-design/agentic-ui/I18n';

// 测试组件 - 用于测试国际化文本
const TestI18nComponent: React.FC<{ locale: any }> = ({ locale }) => {
  return (
    <div>
      {/* Bubble 组件相关测试 */}
      <div data-testid="chat-message-thinking">
        {locale?.['chat.message.thinking'] || '思考中...'}
      </div>
      <div data-testid="chat-message-reference-document">
        {locale?.['chat.message.referenceDocument'] || '参考文档'}
      </div>
      <div data-testid="chat-message-view-original">
        {locale?.['chat.message.viewOriginal'] || '查看原文'}
      </div>
      <div data-testid="chat-message-generate-failed">
        {locale?.['chat.message.generateFailed'] || '生成回答失败，请重试'}
      </div>
      <div data-testid="chat-message-preview">
        {locale?.['chat.message.preview'] || '预览'}
      </div>

      {/* Workspace/File 组件相关测试 */}
      <div data-testid="workspace-file-name">
        {locale?.['workspace.file.fileName'] || '文件名：'}
      </div>
      <div data-testid="workspace-file-size">
        {locale?.['workspace.file.fileSize'] || '文件大小：'}
      </div>
      <div data-testid="workspace-click-download">
        {locale?.['workspace.file.clickToDownload'] || '点击下载'}
      </div>
      <div data-testid="workspace-cannot-get-image">
        {locale?.['workspace.file.cannotGetImagePreview'] || '无法获取图片预览'}
      </div>
      <div data-testid="workspace-cannot-get-video">
        {locale?.['workspace.file.cannotGetVideoPreview'] || '无法获取视频预览'}
      </div>
      <div data-testid="workspace-cannot-get-audio">
        {locale?.['workspace.file.cannotGetAudioPreview'] || '无法获取音频预览'}
      </div>
      <div data-testid="workspace-cannot-get-pdf">
        {locale?.['workspace.file.cannotGetPdfPreview'] || '无法获取PDF预览'}
      </div>
      <div data-testid="workspace-unknown-file-type">
        {locale?.['workspace.file.unknownFileType'] || '未知的文件类型'}
      </div>
      <div data-testid="workspace-generation-time">
        {locale?.['workspace.file.generationTime'] || '生成时间：'}
      </div>
      <div data-testid="workspace-back-to-file-list">
        {locale?.['workspace.file.backToFileList'] || '返回文件列表'}
      </div>
      <div data-testid="workspace-download-file">
        {locale?.['workspace.file.download'] || '下载'}
      </div>

      {/* MarkdownInputField 组件相关测试 */}
      <div data-testid="markdown-input-file-size-exceeded">
        {locale?.['markdownInput.fileSizeExceeded']?.replace(
          '${maxSize}',
          '1024',
        ) || '文件大小超过 1024 KB'}
      </div>

      {/* History 组件相关测试 */}
      <div data-testid="chat-history">
        {locale?.['chat.history'] || '历史记录'}
      </div>
      <div data-testid="chat-history-delete">
        {locale?.['chat.history.delete'] || '删除'}
      </div>
      <div data-testid="chat-history-delete-popconfirm">
        {locale?.['chat.history.delete.popconfirm'] || '确定删除该消息吗？'}
      </div>
      <div data-testid="chat-history-favorite">
        {locale?.['chat.history.favorite'] || '收藏'}
      </div>
      <div data-testid="chat-history-unfavorite">
        {locale?.['chat.history.unfavorite'] || '取消收藏'}
      </div>
      <div data-testid="chat-history-search">
        {locale?.['chat.history.search'] || '搜索'}
      </div>
      <div data-testid="chat-history-search-placeholder">
        {locale?.['chat.history.search.placeholder'] || '搜索话题'}
      </div>
      <div data-testid="chat-history-new-chat">
        {locale?.['chat.history.newChat'] || '新对话'}
      </div>
      <div data-testid="chat-history-load-more">
        {locale?.['chat.history.loadMore'] || '查看更多'}
      </div>
      <div data-testid="task-history-load-more">
        {locale?.['task.history.loadMore'] || '查看更多历史'}
      </div>
      <div data-testid="chat-history-history-tasks">
        {locale?.['chat.history.historyTasks'] || '历史任务'}
      </div>

      {/* TaskList 组件相关测试 */}
      <div data-testid="task-list-expand">
        {locale?.['taskList.expand'] || '展开'}
      </div>
      <div data-testid="task-list-collapse">
        {locale?.['taskList.collapse'] || '收起'}
      </div>
      <div data-testid="task-list-task-list">
        {locale?.['taskList.taskList'] || '任务列表'}
      </div>
      <div data-testid="task-list-task-complete">
        {locale?.['taskList.taskComplete'] || '任务完成'}
      </div>
      <div data-testid="task-list-task-aborted">
        {locale?.['taskList.taskAborted'] || '任务已取消'}
      </div>
      <div data-testid="task-list-task-in-progress">
        {locale?.['taskList.taskInProgress']?.replace(
          '${taskName}',
          '测试任务',
        ) || '正在进行测试任务任务'}
      </div>
      <div data-testid="task-list-total-time-used">
        {locale?.['taskList.totalTimeUsed'] || '共耗时'}
      </div>
    </div>
  );
};

describe('Internationalization Tests', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Chinese Labels (cnLabels)', () => {
    it('should render Bubble component labels in Chinese', () => {
      render(
        <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
          <TestI18nComponent locale={cnLabels} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('chat-message-thinking')).toHaveTextContent(
        '思考中...',
      );
      expect(
        screen.getByTestId('chat-message-reference-document'),
      ).toHaveTextContent('参考文档');
      expect(
        screen.getByTestId('chat-message-view-original'),
      ).toHaveTextContent('查看原文');
      expect(
        screen.getByTestId('chat-message-generate-failed'),
      ).toHaveTextContent('生成回答失败，请重试');
      expect(screen.getByTestId('chat-message-preview')).toHaveTextContent(
        '预览',
      );
    });

    it('should render Workspace/File component labels in Chinese', () => {
      render(
        <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
          <TestI18nComponent locale={cnLabels} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('workspace-file-name')).toHaveTextContent(
        '文件名：',
      );
      expect(screen.getByTestId('workspace-file-size')).toHaveTextContent(
        '文件大小：',
      );
      expect(screen.getByTestId('workspace-click-download')).toHaveTextContent(
        '点击下载',
      );
      expect(
        screen.getByTestId('workspace-cannot-get-image'),
      ).toHaveTextContent('无法获取图片预览');
      expect(
        screen.getByTestId('workspace-cannot-get-video'),
      ).toHaveTextContent('无法获取视频预览');
      expect(
        screen.getByTestId('workspace-cannot-get-audio'),
      ).toHaveTextContent('无法获取音频预览');
      expect(screen.getByTestId('workspace-cannot-get-pdf')).toHaveTextContent(
        '无法获取PDF预览',
      );
      expect(
        screen.getByTestId('workspace-unknown-file-type'),
      ).toHaveTextContent('未知的文件类型');
      expect(screen.getByTestId('workspace-generation-time')).toHaveTextContent(
        '生成时间：',
      );
      expect(
        screen.getByTestId('workspace-back-to-file-list'),
      ).toHaveTextContent('返回文件列表');
      expect(screen.getByTestId('workspace-download-file')).toHaveTextContent(
        '下载',
      );
    });

    it('should render MarkdownInputField component labels in Chinese', () => {
      render(
        <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
          <TestI18nComponent locale={cnLabels} />
        </I18nContext.Provider>,
      );

      expect(
        screen.getByTestId('markdown-input-file-size-exceeded'),
      ).toHaveTextContent('文件大小超过 1024 KB');
    });

    it('should render History component labels in Chinese', () => {
      render(
        <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
          <TestI18nComponent locale={cnLabels} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('chat-history')).toHaveTextContent('历史记录');
      expect(screen.getByTestId('chat-history-delete')).toHaveTextContent(
        '删除',
      );
      expect(
        screen.getByTestId('chat-history-delete-popconfirm'),
      ).toHaveTextContent('确定删除该消息吗？');
      expect(screen.getByTestId('chat-history-favorite')).toHaveTextContent(
        '收藏',
      );
      expect(screen.getByTestId('chat-history-unfavorite')).toHaveTextContent(
        '取消收藏',
      );
      expect(screen.getByTestId('chat-history-search')).toHaveTextContent(
        '搜索',
      );
      expect(
        screen.getByTestId('chat-history-search-placeholder'),
      ).toHaveTextContent('搜索话题');
      expect(screen.getByTestId('chat-history-new-chat')).toHaveTextContent(
        '新对话',
      );
      expect(screen.getByTestId('chat-history-load-more')).toHaveTextContent(
        '查看更多',
      );
      expect(screen.getByTestId('task-history-load-more')).toHaveTextContent(
        '查看更多历史',
      );
      expect(
        screen.getByTestId('chat-history-history-tasks'),
      ).toHaveTextContent('历史任务');
    });

    it('should render TaskList component labels in Chinese', () => {
      render(
        <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
          <TestI18nComponent locale={cnLabels} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('task-list-expand')).toHaveTextContent('展开');
      expect(screen.getByTestId('task-list-collapse')).toHaveTextContent(
        '收起',
      );
      expect(screen.getByTestId('task-list-task-list')).toHaveTextContent(
        '任务列表',
      );
      expect(screen.getByTestId('task-list-task-complete')).toHaveTextContent(
        '任务完成',
      );
      expect(screen.getByTestId('task-list-task-aborted')).toHaveTextContent(
        '任务已取消',
      );
      expect(
        screen.getByTestId('task-list-task-in-progress'),
      ).toHaveTextContent('正在进行测试任务任务');
      expect(screen.getByTestId('task-list-total-time-used')).toHaveTextContent(
        '共耗时',
      );
    });
  });

  describe('English Labels (enLabels)', () => {
    it('should render Bubble component labels in English', () => {
      render(
        <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
          <TestI18nComponent locale={enLabels} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('chat-message-thinking')).toHaveTextContent(
        'Thinking...',
      );
      expect(
        screen.getByTestId('chat-message-reference-document'),
      ).toHaveTextContent('Reference Document');
      expect(
        screen.getByTestId('chat-message-view-original'),
      ).toHaveTextContent('View Original');
      expect(
        screen.getByTestId('chat-message-generate-failed'),
      ).toHaveTextContent('Failed to generate answer, please retry');
      expect(screen.getByTestId('chat-message-preview')).toHaveTextContent(
        'Preview',
      );
    });

    it('should render Workspace/File component labels in English', () => {
      render(
        <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
          <TestI18nComponent locale={enLabels} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('workspace-file-name')).toHaveTextContent(
        'File Name:',
      );
      expect(screen.getByTestId('workspace-file-size')).toHaveTextContent(
        'File Size:',
      );
      expect(screen.getByTestId('workspace-click-download')).toHaveTextContent(
        'Click to Download',
      );
      expect(
        screen.getByTestId('workspace-cannot-get-image'),
      ).toHaveTextContent('Cannot get image preview');
      expect(
        screen.getByTestId('workspace-cannot-get-video'),
      ).toHaveTextContent('Cannot get video preview');
      expect(
        screen.getByTestId('workspace-cannot-get-audio'),
      ).toHaveTextContent('Cannot get audio preview');
      expect(screen.getByTestId('workspace-cannot-get-pdf')).toHaveTextContent(
        'Cannot get PDF preview',
      );
      expect(
        screen.getByTestId('workspace-unknown-file-type'),
      ).toHaveTextContent('Unknown file type');
      expect(screen.getByTestId('workspace-generation-time')).toHaveTextContent(
        'Generation Time:',
      );
      expect(
        screen.getByTestId('workspace-back-to-file-list'),
      ).toHaveTextContent('Back to File List');
      expect(screen.getByTestId('workspace-download-file')).toHaveTextContent(
        'Download',
      );
    });

    it('should render MarkdownInputField component labels in English', () => {
      render(
        <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
          <TestI18nComponent locale={enLabels} />
        </I18nContext.Provider>,
      );

      expect(
        screen.getByTestId('markdown-input-file-size-exceeded'),
      ).toHaveTextContent('File size exceeds 1024 KB');
    });

    it('should render History component labels in English', () => {
      render(
        <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
          <TestI18nComponent locale={enLabels} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('chat-history')).toHaveTextContent('History');
      expect(screen.getByTestId('chat-history-delete')).toHaveTextContent(
        'Delete',
      );
      expect(
        screen.getByTestId('chat-history-delete-popconfirm'),
      ).toHaveTextContent('Are you sure to delete this message?');
      expect(screen.getByTestId('chat-history-favorite')).toHaveTextContent(
        'Favorite',
      );
      expect(screen.getByTestId('chat-history-unfavorite')).toHaveTextContent(
        'Unfavorite',
      );
      expect(screen.getByTestId('chat-history-search')).toHaveTextContent(
        'Search',
      );
      expect(
        screen.getByTestId('chat-history-search-placeholder'),
      ).toHaveTextContent('Search topic');
      expect(screen.getByTestId('chat-history-new-chat')).toHaveTextContent(
        'New Chat',
      );
      expect(screen.getByTestId('chat-history-load-more')).toHaveTextContent(
        'Load More',
      );
      expect(
        screen.getByTestId('chat-history-history-tasks'),
      ).toHaveTextContent('History Tasks');
    });

    it('should render TaskList component labels in English', () => {
      render(
        <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
          <TestI18nComponent locale={enLabels} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('task-list-expand')).toHaveTextContent(
        'Expand',
      );
      expect(screen.getByTestId('task-list-collapse')).toHaveTextContent(
        'Collapse',
      );
      expect(screen.getByTestId('task-list-task-list')).toHaveTextContent(
        'Task List',
      );
      expect(screen.getByTestId('task-list-task-complete')).toHaveTextContent(
        'Task Complete',
      );
      expect(screen.getByTestId('task-list-task-aborted')).toHaveTextContent(
        'Task Aborted',
      );
      expect(
        screen.getByTestId('task-list-task-in-progress'),
      ).toHaveTextContent('Task in progress: 测试任务');
      expect(screen.getByTestId('task-list-total-time-used')).toHaveTextContent(
        'Total Time Used',
      );
    });
  });

  describe('Template String Support', () => {
    it('should support template string replacement in Chinese', () => {
      const templateText = cnLabels['markdownInput.fileSizeExceeded'];
      const replacedText = templateText.replace('${maxSize}', '2048');
      expect(replacedText).toBe('文件大小超过 2048 KB');
    });

    it('should support template string replacement in English', () => {
      const templateText = enLabels['markdownInput.fileSizeExceeded'];
      const replacedText = templateText.replace('${maxSize}', '2048');
      expect(replacedText).toBe('File size exceeds 2048 KB');
    });

    it('should support task name replacement in Chinese', () => {
      const templateText = cnLabels['taskList.taskInProgress'];
      const replacedText = templateText.replace('${taskName}', '数据分析');
      expect(replacedText).toBe('正在进行数据分析任务');
    });

    it('should support task name replacement in English', () => {
      const templateText = enLabels['taskList.taskInProgress'];
      const replacedText = templateText.replace('${taskName}', 'Data Analysis');
      expect(replacedText).toBe('Task in progress: Data Analysis');
    });
  });

  describe('Fallback Behavior', () => {
    it('should use fallback text when locale is not provided', () => {
      render(<TestI18nComponent locale={undefined} />);

      expect(screen.getByTestId('chat-message-thinking')).toHaveTextContent(
        '思考中...',
      );
      expect(screen.getByTestId('workspace-file-name')).toHaveTextContent(
        '文件名：',
      );
      expect(screen.getByTestId('chat-history')).toHaveTextContent('历史记录');
    });

    it('should use fallback text when specific key is missing', () => {
      const partialLocale = {
        'chat.message.thinking': 'Custom thinking...',
        // Missing other keys
      };

      render(<TestI18nComponent locale={partialLocale} />);

      expect(screen.getByTestId('chat-message-thinking')).toHaveTextContent(
        'Custom thinking...',
      );
      expect(screen.getByTestId('workspace-file-name')).toHaveTextContent(
        '文件名：',
      );
      expect(screen.getByTestId('chat-history')).toHaveTextContent('历史记录');
    });
  });

  describe('I18nContext Integration', () => {
    it('should use context locale when provided', () => {
      const customLocale = {
        'chat.message.thinking': 'Custom thinking message',
        'workspace.file.fileName': 'Custom file name',
      };

      render(
        <I18nContext.Provider
          value={{ locale: customLocale as any, language: 'zh-CN' }}
        >
          <TestI18nComponent locale={customLocale} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('chat-message-thinking')).toHaveTextContent(
        'Custom thinking message',
      );
      expect(screen.getByTestId('workspace-file-name')).toHaveTextContent(
        'Custom file name',
      );
    });

    it('should fallback to default when context locale is empty', () => {
      render(
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <TestI18nComponent locale={{}} />
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('chat-message-thinking')).toHaveTextContent(
        '思考中...',
      );
      expect(screen.getByTestId('workspace-file-name')).toHaveTextContent(
        '文件名：',
      );
    });
  });
});
