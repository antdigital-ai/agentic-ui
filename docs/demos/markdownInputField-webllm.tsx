import {
  BubbleList,
  ChatLayout,
  MarkdownEditorInstance,
  MarkdownInputField,
} from '@ant-design/agentic-ui';
import { Alert, Card, Progress, Space, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent' | 'bot';
  content: string;
  createAt: number;
  updateAt: number;
  meta?: {
    avatar?: string;
    title?: string;
    description?: string;
    backgroundColor?: string;
    [key: string]: any;
  };
  extra?: Record<string, any>;
  fileMap?: Map<string, File>;
  error?: any;
  model?: string;
  isFinished?: boolean;
};

/**
 * WebLLM 与 MarkdownInputField 结合示例
 *
 * 本示例展示如何使用 WebLLM 在浏览器中运行大语言模型，
 * 并与 MarkdownInputField 组件结合，实现本地 AI 对话功能。
 *
 * 使用前需要安装 @mlc-ai/web-llm:
 * npm install @mlc-ai/web-llm
 *
 * 注意：WebLLM 需要下载模型文件，首次使用可能需要一些时间。
 */
export default () => {
  const inputRef = useRef<MarkdownEditorInstance>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<
    'unloaded' | 'loading' | 'ready'
  >('unloaded');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadProgressText, setLoadProgressText] = useState('');

  console.log('当前消息数:', messages);

  // WebLLM 引擎实例
  const engineRef = useRef<any>(null);

  /**
   * 初始化 WebLLM 引擎
   * @description 动态加载 WebLLM 库并创建引擎实例
   */
  const initWebLLM = async () => {
    if (engineRef.current) {
      return engineRef.current;
    }

    try {
      setModelStatus('loading');
      setError(null);

      // 动态导入 @mlc-ai/web-llm
      // 注意：实际使用时需要先安装 npm install @mlc-ai/web-llm
      // @ts-ignore - 可选依赖，可能未安装
      const all = await import('@mlc-ai/web-llm');

      // 创建引擎实例
      // 使用 Qwen3-0.6B-q0f16-MLC 模型（轻量级模型，适合快速响应）
      const engine = await all.CreateMLCEngine('Qwen3-0.6B-q0f16-MLC', {
        initProgressCallback: (report: { progress: number; text: string }) => {
          // 更新加载进度
          const progressPercent = Math.round(report.progress * 100);
          setLoadProgress(progressPercent);
          setLoadProgressText(report.text || '');
          console.log('模型加载进度:', report);
        },
      });

      engineRef.current = engine;
      setModelStatus('ready');
      return engine;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'WebLLM 初始化失败';
      setError(errorMsg);
      setModelStatus('unloaded');
      console.error('WebLLM 初始化错误:', err);
      throw err;
    }
  };

  /**
   * 使用 WebLLM 生成回复
   * @param userMessage 用户输入的消息
   * @param conversationHistory 对话历史（传入最新的消息列表）
   * @param onChunk 流式输出回调函数，接收每个内容片段
   * @returns AI 生成的完整回复内容
   */
  const generateResponse = async (
    userMessage: string,
    conversationHistory: ChatMessage[],
    onChunk?: (content: string) => void,
  ): Promise<string> => {
    try {
      // 确保引擎已初始化
      const engine = await initWebLLM();

      // 构建对话历史
      const conversation = [
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage,
        },
      ];

      // 生成回复（流式输出）
      let fullResponse = '';
      const response = await engine.chat.completions.create({
        messages: conversation,
        stream: true,
      });

      // 处理流式输出
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          // 调用流式回调
          onChunk?.(fullResponse);
        }
      }

      return fullResponse;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '生成回复失败';
      throw new Error(errorMsg);
    }
  };

  /**
   * 处理发送消息（流式更新）
   */
  const handleSend = async (value: string) => {
    if (!value.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 添加用户消息
      const now = Date.now();
      const userMessage: ChatMessage = {
        id: `user-${now}`,
        role: 'user',
        content: value,
        createAt: now,
        updateAt: now,
      };
      setMessages((prev) => [...prev, userMessage]);

      // 创建空的 AI 消息用于流式更新
      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createAt: Date.now(),
        updateAt: Date.now(),
        model: 'Qwen3-0.6B-q0f16-MLC',
        isFinished: false,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // 生成 AI 回复（流式更新）- 传入当前的消息历史
      await generateResponse(value, messages, (streamingContent) => {
        // 实时更新 AI 消息内容
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: streamingContent
                    .replace('<think>', '```think')
                    .replace('</think>', '```'),
                  updateAt: Date.now(),
                }
              : msg,
          ),
        );
      });

      // 标记消息生成完成
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, isFinished: true, updateAt: Date.now() }
            : msg,
        ),
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '发送消息失败';
      setError(errorMsg);
      console.error('发送消息错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理停止生成
   */
  const handleStop = () => {
    // WebLLM 目前不支持中断生成，这里可以添加清理逻辑
    setIsLoading(false);
    console.log('停止生成');
  };

  /**
   * 组件挂载时自动加载模型
   */
  useEffect(() => {
    // 自动初始化模型
    initWebLLM().catch((err) => {
      console.error('自动加载模型失败:', err);
    });
  }, []);

  return (
    <>
      {/* 模型状态和进度 */}
      <Card size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Space>
            <Text>模型状态：</Text>
            {modelStatus === 'unloaded' && <Text type="secondary">未加载</Text>}
            {modelStatus === 'loading' && <Text type="warning">加载中...</Text>}
            {modelStatus === 'ready' && <Text type="success">已就绪</Text>}
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
              {loadProgressText && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: '12px',
                    display: 'block',
                    marginTop: '8px',
                  }}
                >
                  {loadProgressText}
                </Text>
              )}
            </div>
          )}
        </Space>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
        />
      )}

      <ChatLayout
        header={{ title: 'AI 对话' }}
        scrollBehavior="auto"
        style={{ minHeight: 'calc(100vh - 120px)' }}
        footer={
          <MarkdownInputField
            inputRef={inputRef}
            placeholder="输入你的问题，按 Enter 发送，Shift+Enter 换行..."
            onSend={handleSend}
            onStop={handleStop}
            disabled={isLoading}
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
            <Text type="secondary">暂无对话记录，开始对话吧！</Text>
          </Space>
        ) : (
          <BubbleList bubbleList={messages} pure />
        )}
      </ChatLayout>

      <Card>
        <Title level={4}>WebLLM + MarkdownInputField 示例</Title>
        <Paragraph>
          本示例展示如何将 <Text code>@mlc-ai/web-llm</Text> 与{' '}
          <Text code>MarkdownInputField</Text> 结合，实现本地 AI 对话功能。
        </Paragraph>
        <Paragraph>
          <Text strong>使用模型：</Text> <Text code>Qwen3-0.6B-q0f16-MLC</Text>
        </Paragraph>
        <Paragraph>
          <Text strong>使用说明：</Text>
        </Paragraph>
        <ul>
          <li>使用轻量级模型 Qwen3-0.6B，适合快速响应和低资源消耗</li>
          <li>首次使用需要下载模型文件，可能需要几分钟时间</li>
          <li>模型会在浏览器本地运行，无需服务器</li>
          <li>支持流式输出，实时显示生成内容</li>
          <li>对话历史会保存在内存中，刷新页面会丢失</li>
        </ul>
        <Paragraph>
          <Text type="warning">
            注意：需要先安装 <Text code>npm install @mlc-ai/web-llm</Text>
          </Text>
        </Paragraph>
      </Card>
    </>
  );
};
