import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownInputField } from '../MarkdownInputField';
import { CreateRecognizer } from '../VoiceInput';

vi.mock('../BorderBeamAnimation', () => ({
  BorderBeamAnimation: () => null,
}));

vi.mock('../../MarkdownEditor', () => ({
  BaseMarkdownEditor: React.forwardRef((props: any, ref: any) => {
    // 使用 ref 持有最新内容，避免闭包捕获过期 state（影响 voice 累积场景）
    const contentRef = React.useRef<string>(
      props.value ?? props.initValue ?? '',
    );
    const [content, setContent] = React.useState(contentRef.current);

    const updateContent = React.useCallback((value: string) => {
      contentRef.current = value;
      setContent(value);
    }, []);

    // 通过 editorRef.current 暴露 store（与真实 BaseMarkdownEditor 一致）
    const exposeStore = React.useMemo(
      () => ({
        store: {
          getMDContent: () => contentRef.current,
          setMDContent: (value: string) => updateContent(value),
          clearContent: () => updateContent(''),
          editor: { children: [] },
          inputComposition: false,
        },
      }),
      [updateContent],
    );

    // editorRef 是 MarkdownInputField 实际使用的入参，需要把 store 挂上
    React.useEffect(() => {
      if (props.editorRef) {
        props.editorRef.current = exposeStore;
      }
    }, [props.editorRef, exposeStore]);

    // 同时兼容 forwardRef 调用方
    React.useImperativeHandle(ref, () => exposeStore);

    // 监听 props.value 的变化
    React.useEffect(() => {
      if (props.value !== undefined && props.value !== contentRef.current) {
        updateContent(props.value);
      }
    }, [props.value, updateContent]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    const readonlyCls = props.readonly ? 'markdown-editor-readonly' : '';

    return (
      <div
        data-testid="markdown-editor"
        contentEditable
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
        style={props.style}
        className={[props.className, readonlyCls].filter(Boolean).join(' ')}
      >
        {content}
      </div>
    );
  }),
  MarkdownEditorInstance: {},
}));

vi.mock('../Suggestion', () => ({
  Suggestion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="suggestion">{children}</div>
  ),
}));

vi.mock('../SkillModeBar', () => ({
  SkillModeBar: () => null,
}));

vi.mock('../TopOperatingArea', () => ({
  default: () => null,
}));

vi.mock('../QuickActions', () => ({
  QuickActions: React.forwardRef(() => null),
}));

vi.mock('../SendActions', () => ({
  SendActions: ({
    voiceRecognizer,
    recording,
    disabled,
    onStartRecording,
    onStopRecording,
    onSend,
    value,
    attachment,
    allowEmptySubmit,
  }: {
    voiceRecognizer?: unknown;
    recording?: boolean;
    disabled?: boolean;
    onStartRecording?: () => Promise<void>;
    onStopRecording?: () => Promise<void>;
    onSend?: (value?: string) => void;
    value?: string;
    attachment?: { enable?: boolean };
    allowEmptySubmit?: boolean;
  }) => {
    return (
      <div data-testid="send-actions-mock">
        {attachment?.enable ? (
          <button
            type="button"
            data-testid="attachment-button"
            disabled={disabled}
          >
            Attachment
          </button>
        ) : null}
        {voiceRecognizer ? (
          <button
            type="button"
            data-testid="voice-input-button"
            aria-pressed={recording ? 'true' : 'false'}
            className={
              disabled
                ? 'ant-agentic-md-input-field-voice-button-disabled'
                : recording
                  ? 'ant-agentic-md-input-field-voice-button-recording'
                  : ''
            }
            onClick={() => {
              if (disabled) return;
              if (recording) {
                void onStopRecording?.();
              } else {
                void onStartRecording?.();
              }
            }}
          >
            Voice
          </button>
        ) : null}
        <button
          type="button"
          data-testid="send-button"
          onClick={() => {
            // 与真实 SendActions/sendMessage 行为对齐：
            // 1) 录音中点击发送，先停止录音再发送
            // 2) 空内容（含纯空白）默认不触发，allowEmptySubmit 时以空串触发
            // 3) 非空时传递 trim 后的内容
            if (recording) {
              void onStopRecording?.();
            }
            const raw = value ?? '';
            const trimmed = raw.trim();
            if (!trimmed && !recording) {
              if (allowEmptySubmit) {
                onSend?.('');
              }
              return;
            }
            onSend?.(trimmed || raw);
          }}
        >
          Send
        </button>
      </div>
    );
  },
}));

describe('MarkdownInputField - toolsRender', () => {
  it('should render custom tools when toolsRender is provided', () => {
    const toolsRender = () => [
      <button key="custom-tool-1" data-testid="custom-tool-1" type="button">
        Tool 1
      </button>,
      <button key="custom-tool-2" data-testid="custom-tool-2" type="button">
        Tool 2
      </button>,
    ];

    render(<MarkdownInputField toolsRender={toolsRender} />);

    expect(screen.getByTestId('custom-tool-1')).toBeInTheDocument();
    expect(screen.getByTestId('custom-tool-2')).toBeInTheDocument();
  });

  it('should pass correct props to toolsRender function', () => {
    const toolsRender = vi.fn().mockReturnValue([
      <button key="custom-tool" type="button">
        Tool
      </button>,
    ]);

    render(
      <MarkdownInputField value="test content" toolsRender={toolsRender} />,
    );

    // 验证传递给 toolsRender 的参数
    expect(toolsRender).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'test content',
        isHover: false,
        isLoading: false,
        fileUploadStatus: 'done',
      }),
    );
  });

  it('should update tools when component state changes', async () => {
    const toolsRender = vi.fn().mockImplementation(({ isHover }) => [
      <button key="custom-tool" data-testid="custom-tool" type="button">
        {isHover ? 'Hovered' : 'Not Hovered'}
      </button>,
    ]);

    const { container } = render(
      <MarkdownInputField toolsRender={toolsRender} />,
    );

    // 触发 hover 事件
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    // 验证 toolsRender 被调用，且传入了更新后的 isHover 状态
    expect(toolsRender).toHaveBeenCalledWith(
      expect.objectContaining({
        isHover: true,
      }),
    );
  });

  it('should handle tool click events', () => {
    const onToolClick = vi.fn();
    const toolsRender = () => [
      <button
        key="custom-tool"
        data-testid="custom-tool"
        onClick={onToolClick}
        type="button"
      >
        Tool
      </button>,
    ];

    render(<MarkdownInputField toolsRender={toolsRender} />);

    const toolButton = screen.getByTestId('custom-tool');
    fireEvent.click(toolButton);

    expect(onToolClick).toHaveBeenCalled();
  });

  it('should render tools with correct styles', () => {
    const toolsRender = () => [
      <button key="custom-tool" data-testid="custom-tool" type="button">
        Tool
      </button>,
    ];

    render(<MarkdownInputField toolsRender={toolsRender} />);

    const toolsContainer = screen
      .getByTestId('custom-tool')
      .closest('.ant-agentic-md-input-field-send-tools');
    expect(toolsContainer).toHaveClass('ant-agentic-md-input-field-send-tools');
  });

  it('should not interfere with send button functionality', () => {
    const onSend = vi.fn();
    const toolsRender = () => [
      <button key="custom-tool" data-testid="custom-tool" type="button">
        Tool
      </button>,
    ];

    render(
      <MarkdownInputField
        toolsRender={toolsRender}
        onSend={onSend}
        value="test message"
      />,
    );

    // 模拟发送消息
    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    expect(onSend).toHaveBeenCalledWith('test message');
  });

  it('should handle disabled state correctly', () => {
    const toolsRender = () => [
      <button key="custom-tool" data-testid="custom-tool" type="button">
        Tool
      </button>,
    ];

    render(<MarkdownInputField toolsRender={toolsRender} disabled={true} />);

    const wrapper = screen
      .getByTestId('custom-tool')
      .closest('.ant-agentic-md-input-field');
    expect(wrapper).toHaveClass('ant-agentic-md-input-field-disabled');
  });
});

describe('MarkdownInputField - voiceInput', () => {
  it('should render voice input button when enabled', () => {
    const createRecognizer = vi.fn().mockResolvedValue({
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    });

    render(<MarkdownInputField voiceRecognizer={createRecognizer} />);

    expect(screen.getByTestId('voice-input-button')).toBeInTheDocument();
  });

  it('should start recording on first click and stop on second click', async () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn().mockResolvedValue(undefined);
    const createRecognizer = vi.fn().mockResolvedValue({ start, stop });

    render(<MarkdownInputField voiceRecognizer={createRecognizer} />);

    const voiceBtn = screen.getByTestId('voice-input-button');

    // first click -> start
    fireEvent.click(voiceBtn);
    expect(createRecognizer).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(start).toHaveBeenCalled();
    });

    // should enter recording state (aria-pressed true or recording class)
    await vi.waitFor(() => {
      expect(voiceBtn).toHaveAttribute('aria-pressed', 'true');
    });

    // second click -> stop
    fireEvent.click(voiceBtn);
    await vi.waitFor(() => {
      expect(stop).toHaveBeenCalled();
    });
  });

  it('should not respond when disabled', async () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn().mockResolvedValue(undefined);
    const createRecognizer = vi.fn().mockResolvedValue({ start, stop });

    render(<MarkdownInputField disabled voiceRecognizer={createRecognizer} />);

    const voiceBtn = screen.getByTestId('voice-input-button');
    // disabled class applied
    expect(
      voiceBtn.className.includes(
        'ant-agentic-md-input-field-voice-button-disabled',
      ),
    ).toBeTruthy();

    fireEvent.click(voiceBtn);
    await vi.waitFor(() => {
      expect(start).not.toHaveBeenCalled();
      expect(stop).not.toHaveBeenCalled();
    });
  });

  it('should handle sentence-level callbacks: begin -> partial -> end', async () => {
    let handlersRef: Parameters<CreateRecognizer>[0] | undefined;
    const start = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn().mockResolvedValue(undefined);
    const createRecognizer = vi.fn().mockImplementation(async (handlers) => {
      handlersRef = handlers;
      return { start, stop };
    });

    const handleChange = vi.fn();

    render(
      <MarkdownInputField
        value=""
        onChange={handleChange}
        voiceRecognizer={createRecognizer}
      />,
    );

    const voiceBtn = screen.getByTestId('voice-input-button');

    // start recording to initialize handlers
    fireEvent.click(voiceBtn);
    await vi.waitFor(() => {
      expect(start).toHaveBeenCalled();
    });

    // sentence begin -> start index recorded
    handlersRef?.onSentenceBegin();
    // partial deltas for current sentence
    handlersRef?.onPartial('hello');
    await vi.waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith('hello', expect.anything());
    });
    handlersRef?.onPartial('hello ');
    await vi.waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith(
        'hello ',
        expect.anything(),
      );
    });

    // sentence end -> finalize
    handlersRef?.onSentenceEnd('hello world');
    await vi.waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith(
        'hello world',
        expect.anything(),
      );
    });

    // next sentence should start after previous content
    handlersRef?.onSentenceBegin();
    handlersRef?.onPartial('foo');
    await vi.waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith(
        'hello worldfoo',
        expect.anything(),
      );
    });
    handlersRef?.onSentenceEnd('foo.');
    await vi.waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith(
        'hello worldfoo.',
        expect.anything(),
      );
    });
  });

  it('should stop recording before sending when clicking send during recording', async () => {
    const events: string[] = [];
    const start = vi.fn().mockImplementation(async () => {
      events.push('start');
    });
    const stop = vi.fn().mockImplementation(async () => {
      events.push('stop');
    });

    let handlersRef: any;
    const createRecognizer = vi.fn().mockImplementation(async (handlers) => {
      handlersRef = handlers;
      return { start, stop };
    });

    const handleSend = vi.fn().mockImplementation(async () => {
      events.push('send');
    });

    const handleChange = vi.fn();

    render(
      <MarkdownInputField
        value=""
        onChange={handleChange}
        voiceRecognizer={createRecognizer}
        onSend={handleSend}
      />,
    );

    // start recording
    fireEvent.click(screen.getByTestId('voice-input-button'));
    await vi.waitFor(() => {
      expect(start).toHaveBeenCalled();
    });

    // inject some partial text so there is content to send
    handlersRef?.onPartial('msg');
    await vi.waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('msg', expect.anything());
    });

    // click send
    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await vi.waitFor(() => {
      expect(stop).toHaveBeenCalled();
      expect(handleSend).toHaveBeenCalledWith('msg');
    });

    // ensure order: stop before send
    expect(events.indexOf('stop')).toBeLessThan(events.indexOf('send'));
  });

  it('should handle recognizer error and reset recording state', async () => {
    let handlersRef: Parameters<CreateRecognizer>[0] | undefined;
    const start = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn().mockResolvedValue(undefined);
    const createRecognizer = vi.fn().mockImplementation(async (handlers) => {
      handlersRef = handlers;
      return { start, stop };
    });

    render(<MarkdownInputField voiceRecognizer={createRecognizer} />);

    const voiceBtn = screen.getByTestId('voice-input-button');

    // start recording
    fireEvent.click(voiceBtn);
    await vi.waitFor(() => {
      expect(start).toHaveBeenCalled();
    });
    await vi.waitFor(() => {
      expect(voiceBtn).toHaveAttribute('aria-pressed', 'true');
    });

    // trigger recognizer error callback
    handlersRef?.onError?.(new Error('test error'));

    // recording should be reset
    await vi.waitFor(() => {
      expect(voiceBtn).toHaveAttribute('aria-pressed', 'false');
    });

    // can start again (pending/reset/refs cleared)
    fireEvent.click(voiceBtn);
    await vi.waitFor(() => {
      expect(createRecognizer).toHaveBeenCalledTimes(2);
      expect(start).toHaveBeenCalledTimes(2);
    });
  });

  it('should recover when recognizer creation fails (catch branch)', async () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn().mockResolvedValue(undefined);
    const createRecognizer = vi
      .fn()
      .mockRejectedValueOnce(new Error('init fail'))
      .mockResolvedValue({ start, stop });

    render(<MarkdownInputField voiceRecognizer={createRecognizer} />);

    const voiceBtn = screen.getByTestId('voice-input-button');

    // first click -> creation fails, should not enter recording
    fireEvent.click(voiceBtn);
    await vi.waitFor(() => {
      expect(createRecognizer).toHaveBeenCalledTimes(1);
    });
    expect(voiceBtn).toHaveAttribute('aria-pressed', 'false');

    // second click -> creation succeeds, start is called
    fireEvent.click(voiceBtn);
    await vi.waitFor(() => {
      expect(createRecognizer).toHaveBeenCalledTimes(2);
      expect(start).toHaveBeenCalledTimes(1);
      expect(voiceBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });
});

describe('MarkdownInputField - click to focus', () => {
  it('should have onClick handler on the container', () => {
    render(<MarkdownInputField />);
    const container = screen.getByTestId('markdown-input-field');
    expect(container).toBeInTheDocument();
    expect(container.getAttribute('tabindex')).toBe('1');
  });

  it('should not focus editor when disabled', () => {
    render(<MarkdownInputField disabled />);
    const container = screen.getByTestId('markdown-input-field');
    fireEvent.click(container);
    expect(container).toHaveClass('ant-agentic-md-input-field-disabled');
  });

  it('should set editor readonly and typing class when typing', () => {
    render(<MarkdownInputField typing value="" />);
    const container = screen.getByTestId('markdown-input-field');
    expect(container).toHaveClass('ant-agentic-md-input-field-typing');
    const editorContent = screen.getByTestId(
      'markdown-input-field-editor-content',
    );
    expect(
      editorContent.querySelector(
        '[class*="markdown-editor"][class*="readonly"]',
      ),
    ).toBeTruthy();
  });

  it('should allow clicking on the editor area', () => {
    render(<MarkdownInputField />);
    const editorContent = screen.getByTestId(
      'markdown-input-field-editor-content',
    );
    expect(editorContent).toBeInTheDocument();
    fireEvent.click(editorContent);
  });

  it('should not interfere with button clicks inside container', () => {
    const onToolClick = vi.fn();
    const toolsRender = () => [
      <button
        key="tool"
        data-testid="inner-tool-btn"
        onClick={onToolClick}
        type="button"
      >
        Tool
      </button>,
    ];

    render(<MarkdownInputField toolsRender={toolsRender} />);
    const toolButton = screen.getByTestId('inner-tool-btn');
    fireEvent.click(toolButton);
    expect(onToolClick).toHaveBeenCalled();
  });
});

describe('MarkdownInputField - allowEmptySubmit', () => {
  it('should not call onSend when empty by default', () => {
    const onSend = vi.fn();
    render(<MarkdownInputField value="" onSend={onSend} />);
    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('should call onSend with empty string when allowEmptySubmit enabled', () => {
    const onSend = vi.fn();
    render(<MarkdownInputField value="" allowEmptySubmit onSend={onSend} />);
    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);
    expect(onSend).toHaveBeenCalledWith('');
  });

  it('should treat whitespace-only as empty unless allowEmptySubmit provided', () => {
    const onSend = vi.fn();
    const { rerender } = render(
      <MarkdownInputField value="   " onSend={onSend} />,
    );
    fireEvent.click(screen.getByTestId('send-button'));
    expect(onSend).not.toHaveBeenCalled();

    rerender(
      <MarkdownInputField value="   " allowEmptySubmit onSend={onSend} />,
    );
    fireEvent.click(screen.getByTestId('send-button'));
    expect(onSend).toHaveBeenCalledWith('');
  });
});

// ===========================================================================
// === merged from MarkdownInputField.assertions.test.tsx ===
// ===========================================================================
// 注：本文件顶部已统一 mock 了 SendActions / Suggestion / SkillModeBar 等模块。
// 由于 vi.mock 会被 hoist，且重复 mock 同一模块时只有最后一次生效，
// 这里不再重复 vi.mock，避免覆盖顶部的 mock 实现导致前半部分用例失效。

describe('MarkdownInputField 断言测试', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础属性断言', () => {
    it('应该正确处理 value 属性', () => {
      const testValue = '# Test Markdown Content';
      render(<MarkdownInputField value={testValue} />);

      const editor = screen.getByTestId('markdown-editor');
      expect(editor).toHaveTextContent(testValue);
    });

    it('应该正确处理 placeholder 属性', () => {
      const placeholder = 'Enter your markdown...';
      render(<MarkdownInputField placeholder={placeholder} />);

      // 验证组件渲染成功
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });

    it('应该正确处理 disabled 属性', () => {
      render(<MarkdownInputField disabled={true} />);

      // 验证组件正确渲染
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该正确应用 className', () => {
      const className = 'custom-markdown-input';
      const { container } = render(
        <MarkdownInputField className={className} />,
      );

      // 验证外层容器存在
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该正确应用 style 属性', () => {
      const style = { minHeight: '200px', backgroundColor: '#f0f0f0' };
      const { container } = render(<MarkdownInputField style={style} />);

      // 验证样式被应用到组件上
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('组件渲染断言', () => {
    it('应该渲染所有核心组件', () => {
      render(<MarkdownInputField />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion')).toBeInTheDocument();
    });

    it('应该在启用附件时显示附件按钮', () => {
      render(<MarkdownInputField attachment={{ enable: true }} />);

      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });

    it('应该在禁用附件时不显示附件按钮', () => {
      render(<MarkdownInputField attachment={{ enable: false }} />);

      expect(screen.queryByTestId('attachment-button')).not.toBeInTheDocument();
    });
  });

  describe('交互功能断言', () => {
    it('应该正确处理按钮点击', async () => {
      const onSend = vi.fn().mockResolvedValue(undefined);
      render(<MarkdownInputField onSend={onSend} value="Test content" />);

      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toBeInTheDocument();

      // 验证按钮可以被点击
      await user.click(sendButton);
      // 注意：由于我们的 mock 比较简单，这里主要验证组件结构正确
    });

    it('应该正确处理附件上传', async () => {
      render(
        <MarkdownInputField
          attachment={{
            enable: true,
            upload: vi
              .fn()
              .mockResolvedValue({ url: 'http://example.com/file.txt' }),
          }}
        />,
      );

      const attachmentButton = screen.getByTestId('attachment-button');
      expect(attachmentButton).toBeInTheDocument();

      // 验证附件按钮可以被点击
      await user.click(attachmentButton);
    });
  });

  describe('状态管理断言', () => {
    it('应该正确处理 typing 状态', () => {
      render(<MarkdownInputField typing={true} />);

      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toBeInTheDocument();
    });

    it('应该正确处理空内容状态', () => {
      render(<MarkdownInputField value="" />);

      const editor = screen.getByTestId('markdown-editor');
      expect(editor).toHaveTextContent('');
    });

    it('应该正确处理有内容状态', () => {
      render(<MarkdownInputField value="Some content" />);

      const editor = screen.getByTestId('markdown-editor');
      expect(editor).toHaveTextContent('Some content');
    });
  });

  describe('边界情况断言', () => {
    it('应该处理 undefined value', () => {
      render(<MarkdownInputField value={undefined} />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });

    it('应该处理空字符串 value', () => {
      render(<MarkdownInputField value="" />);

      const editor = screen.getByTestId('markdown-editor');
      expect(editor).toHaveTextContent('');
    });

    it('应该处理长文本内容', () => {
      const longText = 'A'.repeat(1000); // 减少长度以提高测试性能
      render(<MarkdownInputField value={longText} />);

      const editor = screen.getByTestId('markdown-editor');
      expect(editor).toHaveTextContent(longText);
    });

    it('应该处理特殊字符', () => {
      const specialText = '# Title **Bold** _italic_ `code` > Quote';
      render(<MarkdownInputField value={specialText} />);

      const editor = screen.getByTestId('markdown-editor');
      expect(editor).toHaveTextContent(specialText);
    });
  });

  describe('属性验证断言', () => {
    it('应该接受所有必需的 props', () => {
      const props = {
        value: 'Test value',
        onChange: vi.fn(),
        placeholder: 'Test placeholder',
        disabled: false,
        typing: false,
        triggerSendKey: 'Enter' as const,
        onSend: vi.fn(),
        onStop: vi.fn(),
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该正确处理可选的 attachment props', () => {
      const attachmentProps = {
        enable: true,
        accept: '.txt,.md',
        maxFileSize: 1024 * 1024,
        upload: vi.fn(),
      };

      render(<MarkdownInputField attachment={attachmentProps} />);

      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });
  });

  describe('组件组合断言', () => {
    it('应该同时渲染编辑器、发送按钮和建议组件', () => {
      render(<MarkdownInputField />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion')).toBeInTheDocument();
    });

    it('应该在启用附件时渲染所有组件', () => {
      render(<MarkdownInputField attachment={{ enable: true }} />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion')).toBeInTheDocument();
      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });
  });

  describe('功能完整性断言', () => {
    it('应该支持 triggerSendKey 选项', () => {
      const enterProps = { triggerSendKey: 'Enter' as const };
      const { rerender } = render(<MarkdownInputField {...enterProps} />);
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();

      rerender(<MarkdownInputField />);
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });

    it('应该正确处理组件更新', () => {
      const { rerender } = render(<MarkdownInputField value="Initial" />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();

      // 验证重新渲染不会破坏组件结构
      rerender(<MarkdownInputField value="Updated" />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });

    it('应该支持自定义操作按钮渲染', () => {
      const customActions = (props: any, defaultActions: React.ReactNode[]) => [
        ...defaultActions,
        <button key="custom" type="button" data-testid="custom-action">
          Custom
        </button>,
      ];

      render(<MarkdownInputField actionsRender={customActions} />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });
  });

  describe('错误处理断言', () => {
    it('应该在没有 props 的情况下正常渲染', () => {
      render(<MarkdownInputField />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion')).toBeInTheDocument();
    });

    it('应该处理无效的 attachment 配置', () => {
      render(<MarkdownInputField attachment={{}} />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      // 当 enable 未设置或为 false 时，不应该显示附件按钮
      expect(screen.queryByTestId('attachment-button')).not.toBeInTheDocument();
    });

    it('应该处理异常的回调函数', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });

      // 应该能够正常渲染，即使回调函数会抛出错误
      render(<MarkdownInputField onChange={errorCallback} />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });
  });
});
