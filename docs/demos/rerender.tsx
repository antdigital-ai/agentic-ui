/* eslint-disable @typescript-eslint/no-loop-func */
import { MarkdownRenderer, useAutoScroll } from '@ant-design/agentic-ui';
import {
  ClearOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, Input, Radio, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

type SpeedType = 'block' | 'fast' | 'medium' | 'slow';

/**
 * 将 markdown 按 block（\n\n）分割，保留分隔符
 */
const splitBlocks = (text: string): string[] => {
  const blocks: string[] = [];
  let current = '';
  let inFence = false;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.trimStart().startsWith('```') ||
      line.trimStart().startsWith('~~~')
    ) {
      inFence = !inFence;
    }
    current += (current ? '\n' : '') + line;
    if (
      !inFence &&
      line === '' &&
      i + 1 < lines.length &&
      lines[i + 1] === ''
    ) {
      continue;
    }
    if (!inFence && line === '' && current.trim()) {
      blocks.push(current);
      current = '';
    }
  }
  if (current) blocks.push(current);
  return blocks;
};

// md 渲染 demo —— 使用 MarkdownRenderer（无 Slate 实例）
export const RerenderMdDemo = () => {
  const { containerRef } = useAutoScroll();
  const [content, setContent] = useState('');
  const [speed, setSpeed] = useState<SpeedType>('fast');
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const pauseRef = useRef(false);
  const currentIndexRef = useRef(0);
  const speedRef = useRef<SpeedType>('fast');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  const clearContent = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setContent('');
    setIsFinished(false);
    currentIndexRef.current = 0;
  };

  const restart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setContent('');
    setIsFinished(false);
    currentIndexRef.current = 0;
    setIsPaused(false);
    pauseRef.current = false;
    setRestartKey((prev) => prev + 1);
  };

  useEffect(() => {
    const blocks = splitBlocks(newEnergyFundContent);
    const chars = newEnergyFundContent.split('');
    let md = '';
    currentIndexRef.current = 0;
    setIsFinished(false);

    if (process.env.NODE_ENV === 'test') {
      setContent(newEnergyFundContent);
      setIsFinished(true);
      return;
    }

    const processNext = () => {
      const isBlock = speedRef.current === 'block';

      if (isBlock) {
        if (currentIndexRef.current >= blocks.length) {
          setIsFinished(true);
          return;
        }
        if (pauseRef.current) {
          timeoutRef.current = setTimeout(processNext, 100);
          return;
        }
        md = blocks.slice(0, currentIndexRef.current + 1).join('\n');
        currentIndexRef.current += 1;
        timeoutRef.current = setTimeout(() => {
          setContent(md);
          processNext();
        }, 50);
      } else {
        if (currentIndexRef.current >= chars.length) {
          setIsFinished(true);
          return;
        }
        if (pauseRef.current) {
          timeoutRef.current = setTimeout(processNext, 100);
          return;
        }
        md += chars[currentIndexRef.current];
        currentIndexRef.current += 1;
        const delay =
          speedRef.current === 'fast'
            ? 1
            : speedRef.current === 'medium'
              ? 16
              : 160;
        timeoutRef.current = setTimeout(() => {
          setContent(md);
          processNext();
        }, delay);
      }
    };

    processNext();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [restartKey]);

  return (
    <div
      id="container"
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        backgroundColor: '#fff',
        overflow: 'auto',
        boxSizing: 'border-box',
        maxHeight: 'calc(100vh)',
      }}
    >
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Space>
          <span>速度：</span>
          <Radio.Group
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="block">逐块</Radio.Button>
            <Radio.Button value="fast">快</Radio.Button>
            <Radio.Button value="medium">中</Radio.Button>
            <Radio.Button value="slow">慢</Radio.Button>
          </Radio.Group>
          <Button
            type="primary"
            icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '继续' : '暂停'}
          </Button>
          <Button icon={<ClearOutlined />} onClick={clearContent}>
            清空
          </Button>
          <Button type="primary" icon={<ReloadOutlined />} onClick={restart}>
            再来一次
          </Button>
        </Space>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
        <Input.TextArea
          value={content}
          style={{
            width: 'calc(50vw - 32px)',
            whiteSpace: 'pre-wrap',
            minHeight: 'calc(100vh - 280px)',
            backgroundColor: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
            fontFamily: 'monospace',
            fontSize: 14,
            lineHeight: 1.5,
            overflowX: 'auto',
            wordBreak: 'break-all',
            wordWrap: 'break-word',
            border: '1px solid #e0e0e0',
            color: '#333',
            fontWeight: 500,
          }}
        />
        <MarkdownRenderer
          content={content}
          streaming={!isFinished}
          isFinished={isFinished}
          queueOptions={{ animate: false }}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>MarkdownRenderer 模式说明：</h4>
        <ul>
          <li>
            <strong>MarkdownRenderer</strong>: 使用轻量 Markdown 渲染器，不创建
            Slate 实例
          </li>
          <li>
            <strong>content</strong>: markdown 内容字符串（持续增长）
          </li>
          <li>
            <strong>streaming</strong>: 是否处于流式状态
          </li>
          <li>
            <strong>isFinished</strong>: 流式是否完成
          </li>
          <li>
            <strong>queueOptions</strong>: 字符队列配置，animate=false
            表示由外部控制逐字输出
          </li>
        </ul>
        <h4>与 Slate 模式对比：</h4>
        <ul>
          <li>
            无需 <code>MarkdownEditorInstance</code>、
            <code>store.updateNodeList</code>、
            <code>parserMarkdownToSlateNode</code>
          </li>
          <li>
            无 Slate Editor 实例、无 Operation 队列、无 History 栈、无 Normalize
          </li>
          <li>
            Markdown → hast → React（两层），而非 Markdown → mdast → Slate →
            React（四层）
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RerenderMdDemo;
