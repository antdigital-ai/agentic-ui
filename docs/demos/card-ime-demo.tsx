import { BaseMarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const CardIMEDemo = () => {
  // 使用简单的markdown初始化
  const initValue = `# 中文输入法测试演示

请在下面的编辑器中手动创建卡片来测试中文输入法功能。

您可以：
1. 输入 \`@\` 来创建卡片
2. 点击卡片进行编辑
3. 使用中文输入法测试输入

`;

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>中文输入法 Card-After 测试</h2>
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e9ecef',
          }}
        >
          <strong>🧪 测试步骤：</strong>
          <ol style={{ margin: '12px 0 0 0', paddingLeft: '20px' }}>
            <li>点击任意卡片，会自动选中到 card-after</li>
            <li>使用中文输入法（如搜狗、微软拼音等）输入中文</li>
            <li>验证输入的文字是否出现在卡片后面的新段落中</li>
            <li>验证在 card-before 区域无法输入任何内容</li>
          </ol>
        </div>

        <div
          style={{
            backgroundColor: '#fff3cd',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffeaa7',
          }}
        >
          <strong>⚡ 预期行为：</strong>
          <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px' }}>
            <li>点击卡片后，在 card-after 区域使用中文输入法输入</li>
            <li>输入的中文内容应该出现在卡片后面的新段落中</li>
            <li>而不是直接在 card-after 区域中显示</li>
            <li>这确保了卡片结构的完整性</li>
          </ul>
        </div>

        <div
          style={{
            backgroundColor: '#d4edda',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb',
          }}
        >
          <strong>🔧 技术说明：</strong>
          <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px' }}>
            <li>
              修复了中文输入法通过 <code>Editor.insertText</code> 绕过拦截的问题
            </li>
            <li>
              在操作层面拦截 <code>insert_text</code> 操作
            </li>
            <li>
              使用 <code>Editor.withoutNormalizing</code> 确保操作的原子性
            </li>
            <li>支持所有类型的输入法和 composition 事件</li>
          </ul>
        </div>
      </div>

      <div
        style={{
          border: '1px solid #e1e4e8',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <BaseMarkdownEditor
          initValue={initValue}
          onChange={(value: any) => {
            console.log('编辑器内容更新:', value);
          }}
          style={{
            minHeight: '500px',
            padding: '20px',
          }}
        />
        <div>
          <h4>Props 说明</h4>
          <ul>
            <li>
              <code>initValue</code> - 初始化的 Markdown
              内容，包含中文输入法测试说明
            </li>
            <li>
              <code>onChange</code> - 内容变化回调函数，输出到控制台
            </li>
            <li>
              <code>style</code> - 样式配置，设置最小高度和内边距
            </li>
            <li>
              <code>value</code> - onChange 回调中的值参数，包含编辑器当前内容
            </li>
            <li>
              <code>CardIMEDemo</code> - 中文输入法测试演示组件
            </li>
            <li>
              <code>BaseMarkdownEditor</code> - 基础 Markdown 编辑器组件
            </li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
        <p>
          <strong>测试提示：</strong>
        </p>
        <ul>
          <li>尝试在不同的卡片中使用中文输入法</li>
          <li>测试输入汉字、标点符号等</li>
          <li>验证输入法候选词选择是否正常工作</li>
          <li>检查是否有重复输入或丢失输入的情况</li>
        </ul>
      </div>
    </div>
  );
};

export default CardIMEDemo;
