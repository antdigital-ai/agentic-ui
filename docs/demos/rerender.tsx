/* eslint-disable @typescript-eslint/no-loop-func */
import {
  MarkdownEditor,
  MarkdownEditorInstance,
  parserMarkdownToSlateNode,
  useAutoScroll,
} from '@ant-design/agentic-ui';
import { ChartElement } from '@ant-design/agentic-ui/Plugins/chart';
import { CodeElement } from '@ant-design/agentic-ui/Plugins/code';
import { MermaidElement } from '@ant-design/agentic-ui/Plugins/mermaid';
import {
  ClearOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, Input, Radio, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

const SPEED_CONFIG = {
  fast: 1,
  medium: 16,
  slow: 160,
} as const;

type SpeedType = keyof typeof SPEED_CONFIG;

// md 逐字符渲染 demo
export const RerenderMdDemo = () => {
  const instance = useRef<MarkdownEditorInstance>();
  const { containerRef } = useAutoScroll();
  const [value, setValue] = useState('');
  const [speed, setSpeed] = useState<SpeedType>('medium');
  const [isPaused, setIsPaused] = useState(false);
  const pauseRef = useRef(false);
  const currentIndexRef = useRef(0);
  const speedRef = useRef<number>(SPEED_CONFIG.medium);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    speedRef.current = SPEED_CONFIG[speed];
  }, [speed]);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  const clearContent = () => {
    // 清除定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // 清空内容
    setValue('');
    currentIndexRef.current = 0;
    // 清空编辑器内容
    instance.current?.store.updateNodeList(
      parserMarkdownToSlateNode('').schema,
    );
  };

  const restart = () => {
    // 清除定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // 重置状态
    setValue('');
    currentIndexRef.current = 0;
    setIsPaused(false);
    pauseRef.current = false;
    // 触发重新渲染
    setRestartKey((prev) => prev + 1);
  };

  useEffect(() => {
    let md = '';
    const list = newEnergyFundContent.split('');
    currentIndexRef.current = 0;

    const run = () => {
      if (process.env.NODE_ENV === 'test') {
        instance.current?.store.updateNodeList(
          parserMarkdownToSlateNode(newEnergyFundContent).schema,
        );
        return;
      }

      const processNext = async () => {
        if (currentIndexRef.current >= list.length) {
          await instance.current?.store.updateNodeList(
            parserMarkdownToSlateNode(md).schema,
          );

          return;
        }

        if (pauseRef.current) {
          timeoutRef.current = setTimeout(processNext, 100);
          return;
        }

        md += list[currentIndexRef.current];
        const index = currentIndexRef.current;
        currentIndexRef.current = index + 1;

        timeoutRef.current = setTimeout(() => {
          instance.current?.store.updateNodeList(
            parserMarkdownToSlateNode(md).schema,
          );
          setValue(md);
          processNext();
        }, speedRef.current);
      };

      processNext();
    };
    run();

    // 清理函数
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
          value={value}
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
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontStretch: 'normal',
            fontVariantLigatures: 'normal',
            fontVariantNumeric: 'normal',
            fontVariantAlternates: 'normal',
          }}
        />
        <MarkdownEditor
          editorRef={instance}
          toc={false}
          plugins={[
            {
              elements: {
                code: CodeElement,
                chart: ChartElement,
                mermaid: MermaidElement,
              },
            },
          ]}
          width={'100%'}
          typewriter
          height={'auto'}
          readonly
        />
      </div>

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>editorRef</strong>: 编辑器实例引用，用于调用编辑器方法
          </li>
          <li>
            <strong>toc</strong>: 是否显示目录，设置为 false 隐藏目录
          </li>
          <li>
            <strong>plugins</strong>: 插件数组，用于扩展编辑器功能
          </li>
          <li>
            <strong>plugins[].elements</strong>: 自定义元素渲染配置
          </li>
          <li>
            <strong>width</strong>: 编辑器宽度
          </li>
          <li>
            <strong>typewriter</strong>: 打字机模式，启用打字机效果
          </li>
          <li>
            <strong>height</strong>: 编辑器高度，设置为 &apos;auto&apos; 自适应
          </li>
          <li>
            <strong>readonly</strong>: 只读模式，禁用编辑功能
          </li>
          <li>
            <strong>useAutoScroll</strong>: 自动滚动 Hook，提供 containerRef
          </li>
          <li>
            <strong>store.updateNodeList</strong>: 更新节点列表的方法
          </li>
          <li>
            <strong>store.setMDContent</strong>: 设置 Markdown 内容的方法
          </li>
          <li>
            <strong>parserMarkdownToSlateNode</strong>: 将 Markdown 解析为 Slate
            节点的工具函数
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RerenderMdDemo;
