import { MarkdownInputField } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

/**
 * MarkdownInputField 组件演示页面
 *
 * 展示 MarkdownInputField 组件的各种使用方式和功能特性：
 * - 基础用法
 * - 禁用状态
 * - 暗色主题
 *
 * @returns 演示页面组件
 */
export default function MarkdownInputFieldDemo() {
  const [value, setValue] = useState('');

  return (
    <div style={{ padding: '24px' }}>
      <h2>基础用法</h2>
      <MarkdownInputField
        value={value}
        onChange={setValue}
        placeholder="请输入内容..."
      />

      <h2>禁用状态</h2>
      <MarkdownInputField
        value={value}
        onChange={setValue}
        placeholder="禁用状态"
        disabled
      />

      <h2>暗色主题演示</h2>
      <div
        style={{
          background: '#141414',
          padding: '24px',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#fff', marginBottom: '16px' }}>基础用法</h3>
        <MarkdownInputField
          value={value}
          onChange={setValue}
          placeholder="请输入内容..."
        />

        <h3 style={{ color: '#fff', marginTop: '24px', marginBottom: '16px' }}>
          禁用状态
        </h3>
        <MarkdownInputField
          value={value}
          onChange={setValue}
          placeholder="禁用状态"
          disabled
        />
      </div>
    </div>
  );
}
