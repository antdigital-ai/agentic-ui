import {
  BubbleList,
  ChatLayout,
  MarkdownEditorInstance,
  MarkdownInputField,
} from '@ant-design/agentic-ui';
import type { MLCEngine } from '@mlc-ai/web-llm';
import { Alert, Button, Card, Progress, Space, Typography } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const { Paragraph, Text, Title } = Typography;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createAt: number;
  updateAt: number;
  isFinished?: boolean;
};

const MODEL_ID = 'Qwen3-0.6B-q0f16-MLC';

/**
 * WebLLM 与 MarkdownInputField 结合示例（需安装 @mlc-ai/web-llm）
 */
export default () => {
  const inputRef = useRef<MarkdownEditorInstance>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<
    'unloaded' | 'loading' | 'ready'
  >('unloaded');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadProgressText, setLoadProgressText] = useState('');
  const engineRef = useRef<MLCEngine | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const initWebLLM = useCallback(async () => {
    if (engineRef.current) {
      return engineRef.current;
    }

    setModelStatus('loading');
    setError(null);

    const webllm = await import('@mlc-ai/web-llm');
    const engine = await webllm.CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (report: { progress: number; text: string }) => {
        setLoadProgress(Math.round(report.progress * 100));
        setLoadProgressText(report.text || '');
      },
    });

    engineRef.current = engine;
    setModelStatus('ready');
    return engine;
  }, []);

  const handleLoadModel = useCallback(() => {
    initWebLLM().catch((err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : 'WebLLM 初始化失败';
      setError(errorMsg);
      setModelStatus('unloaded');
    });
  }, [initWebLLM]);

  const generateResponse = useCallback(
    async (
      userMessage: string,
      conversationHistory: ChatMessage[],
      assistantId: string,
      onChunk?: (content: string) => void,
    ): Promise<void> => {
      const engine = await initWebLLM();
      const conversation = [
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user' as const, content: userMessage },
      ];

      let fullResponse = '';
      const response = await engine.chat.completions.create({
        messages: conversation,
        stream: true,
      });

      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            onChunk?.(fullResponse);
          }
        }
      } finally {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, isFinished: true, updateAt: Date.now() }
              : msg,
          ),
        );
      }
    },
    [initWebLLM],
  );

  const handleSend = useCallback(
    async (value: string) => {
      if (!value.trim()) {
        return;
      }
      if (modelStatus !== 'ready' || !engineRef.current) {
        setError('请先点击「加载模型」并等待就绪后再发送。');
        return;
      }

      setIsLoading(true);
      setError(null);

      const now = Date.now();
      const userMessage: ChatMessage = {
        id: `user-${now}`,
        role: 'user',
        content: value,
        createAt: now,
        updateAt: now,
      };
      const assistantId = `assistant-${now}`;
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createAt: now,
        updateAt: now,
        isFinished: false,
      };

      const historyForApi = [...messagesRef.current, userMessage];

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      try {
        await generateResponse(value, historyForApi, assistantId, (text) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: text, updateAt: Date.now() }
                : msg,
            ),
          );
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : '发送消息失败';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [generateResponse, modelStatus],
  );

  const handleStop = useCallback(() => {
    engineRef.current?.interruptGenerate();
    setIsLoading(false);
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card size="small">
        <Paragraph style={{ marginBottom: 12 }}>
          本示例将 <Text code>@mlc-ai/web-llm</Text> 与{' '}
          <Text code>MarkdownInputField</Text> 接入同一聊天布局。请先安装依赖{' '}
          <Text code>pnpm add @mlc-ai/web-llm</Text>
          ，再点击下方按钮加载模型（避免打开文档页即自动下载大文件）。
        </Paragraph>
        <Title level={5} style={{ marginTop: 0 }}>
          模型：{MODEL_ID}
        </Title>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Space wrap>
            <Text>状态：</Text>
            {modelStatus === 'unloaded' && <Text type="secondary">未加载</Text>}
            {modelStatus === 'loading' && <Text type="warning">加载中…</Text>}
            {modelStatus === 'ready' && <Text type="success">已就绪</Text>}
            <Button
              type="primary"
              size="small"
              loading={modelStatus === 'loading'}
              disabled={modelStatus === 'ready' || modelStatus === 'loading'}
              onClick={handleLoadModel}
            >
              加载模型
            </Button>
          </Space>
          {modelStatus === 'loading' && (
            <div style={{ width: '100%' }}>
              <Progress
                percent={loadProgress}
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={(percent) => `${percent}%`}
              />
              {loadProgressText ? (
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    display: 'block',
                    marginTop: 8,
                  }}
                >
                  {loadProgressText}
                </Text>
              ) : null}
            </div>
          )}
        </Space>
      </Card>

      {error ? (
        <Alert
          message="错误"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
        />
      ) : null}

      <ChatLayout
        header={{ title: 'AI 对话' }}
        scrollBehavior="auto"
        style={{ minHeight: 480 }}
        footer={
          <MarkdownInputField
            inputRef={inputRef}
            placeholder="输入你的问题，按 Enter 发送，Shift+Enter 换行…"
            onSend={handleSend}
            onStop={handleStop}
            disabled={isLoading || modelStatus !== 'ready'}
            typing={isLoading}
            style={{ minHeight: 120 }}
          />
        }
      >
        {messages.length === 0 ? (
          <Space
            direction="vertical"
            style={{ width: '100%', padding: 16 }}
            size="large"
          >
            <Text type="secondary">
              {modelStatus === 'ready'
                ? '暂无对话记录，开始对话吧。'
                : '加载模型后即可开始对话。'}
            </Text>
          </Space>
        ) : (
          <BubbleList bubbleList={messages} pure />
        )}
      </ChatLayout>

      <Card size="small">
        <ul style={{ margin: 0, paddingInlineStart: 20 }}>
          <li>
            停止按钮会调用引擎的 <Text code>interruptGenerate()</Text>
            ，已生成的文本会保留。
          </li>
          <li>对话仅保存在内存中，刷新页面会丢失。</li>
        </ul>
      </Card>
    </Space>
  );
};
