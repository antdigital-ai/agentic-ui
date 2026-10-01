import { MarkdownEditor, MarkdownEditorInstance } from '@ant-design/agentic-ui';
import { Button, Card, Space, Typography } from 'antd';
import React, { useEffect, useRef } from 'react';

const { Title, Paragraph } = Typography;

export default () => {
  const editorRef = useRef<MarkdownEditorInstance | null>(null);

  // 简单的测试内容，包含多个标题层级
  const testContent = `# 测试 TocHeading 功能

这是一个简单的 TocHeading 测试页面。

## 二级标题

### 三级标题

#### 四级标题

### 另一个三级标题

## 另一个二级标题

### 测试锚点定位

点击目录中的链接应该能够准确定位到这里。

### 测试滚动效果

当页面滚动时，目录应该正确高亮当前标题。

## 长文本测试

这里包含一些长文本内容，用于测试在长文档中 TocHeading 的表现。

### 性能测试

在包含多个标题的文档中，TocHeading 应该保持良好的性能表现。

## 边界测试

### 容器测试

测试在不同容器大小下 TocHeading 的表现。

### 响应式测试

测试在窗口大小变化时 TocHeading 的响应式表现。

## 总结

这个简单的测试页面用于验证 TocHeading 组件的各项功能。
`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // @ts-ignore
    window.editorRef = editorRef;
  }, []);

  const handleTestAnchor = () => {
    const container = editorRef.current?.markdownContainerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      console.log('=== TocHeading 测试信息 ===');
      console.log('编辑器容器位置:', rect);
      console.log(
        '容器在视口内:',
        rect.top < window.innerHeight && rect.bottom > 0,
      );
      console.log('容器高度:', rect.height);
      console.log('容器宽度:', rect.width);

      // 检查是否有 TocHeading 相关的 DOM 元素
      const tocElements = document.querySelectorAll('[class*="anchor"]');
      console.log('找到的 Anchor 相关元素:', tocElements.length);

      // 检查 TocHeading 是否在容器内
      const tocInContainer = container.querySelector('[class*="anchor"]');
      console.log('TocHeading 在容器内:', !!tocInContainer);
    }
  };

  const handleTestScroll = () => {
    const container = editorRef.current?.markdownContainerRef.current;
    if (container) {
      // 滚动到文档中间
      container.scrollTo({
        top: container.scrollHeight / 2,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Title level={2}>TocHeading 简单测试</Title>

      <Card style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Paragraph>
            这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
            右侧应该显示目录，点击目录链接可以定位到对应的标题。
          </Paragraph>

          <Space>
            <Button onClick={handleTestAnchor} type="primary">
              测试 Anchor 信息
            </Button>
            <Button onClick={handleTestScroll}>测试滚动效果</Button>
          </Space>

          <Paragraph type="secondary">
            打开浏览器开发者工具的控制台查看测试结果。
          </Paragraph>
        </Space>
      </Card>

      <div>
        <MarkdownEditor
          editorRef={editorRef}
          width={'100%'}
          height={'100vh'}
          initValue={testContent + testContent + testContent}
          onChange={(value) => {
            console.log('编辑器内容变化:', value.length, '字符');
          }}
        />
      </div>
      <Card style={{ marginBottom: '16px' }}>
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
        这个演示页面用于测试 TocHeading 组件的 Anchor 渲染效果。
        右侧应该显示目录，点击目录链接可以定位到对应的标题。
      </Card>
    </div>
  );
};
