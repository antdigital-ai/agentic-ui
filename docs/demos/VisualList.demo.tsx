import { VisualList, VisualListItem } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * VisualList 组件演示数据
 * 包含各种类型的图片数据，用于展示组件的不同功能
 */
const mockData: VisualListItem[] = [
  {
    id: '1',
    src: 'https://avatars.githubusercontent.com/u/1?v=4',
    alt: 'User 1',
    title: 'GitHub User 1',
    href: 'https://github.com/user1',
  },
  {
    id: '2',
    src: 'https://avatars.githubusercontent.com/u/2?v=4',
    alt: 'User 2',
    title: 'GitHub User 2',
    href: 'https://github.com/user2',
  },
  {
    id: '3',
    src: 'https://avatars.githubusercontent.com/u/3?v=4',
    alt: 'User 3',
    title: 'GitHub User 3',
  },
  {
    id: '4',
    src: 'https://avatars.githubusercontent.com/u/4?v=4',
    alt: 'User 4',
    title: 'GitHub User 4',
    href: 'https://github.com/user4',
  },
];

/**
 * VisualList 组件演示页面
 *
 * 展示 VisualList 组件的各种使用方式和功能特性：
 * - 基础用法
 * - 不同尺寸和形状
 * - 数据过滤
 * - 自定义渲染
 * - 空状态和加载状态
 *
 * @returns 演示页面组件
 */
export default function VisualListDemo() {
  return (
    <div style={{ padding: '12px' }}>
      <h2>基础用法</h2>
      <VisualList data={mockData} />

      <h2>自定义样式</h2>
      <VisualList data={mockData} shape="circle" />

      <h2>过滤数据</h2>
      <VisualList data={mockData} filter={(item) => item.href !== undefined} />

      <h2>自定义渲染</h2>
      <VisualList
        data={mockData}
        renderItem={(item, index) => (
          <li
            key={item.id || index}
            style={{
              margin: '4px',
              padding: '8px',
              border: '2px solid #007acc',
              borderRadius: '12px',
              backgroundColor: '#f0f8ff',
            }}
          >
            <img
              src={item.src}
              alt={item.alt}
              style={{ width: 50, height: 50, borderRadius: '8px' }}
            />
            <div
              style={{
                fontSize: '12px',
                textAlign: 'center',
                marginTop: '4px',
              }}
            >
              {item.title}
            </div>
          </li>
        )}
      />

      <h2>空状态</h2>
      <VisualList
        data={[]}
        emptyRender={() => (
          <div style={{ color: '#999', fontStyle: 'italic' }}>暂无图片数据</div>
        )}
      />

      <h2>加载状态</h2>
      <VisualList
        data={[]}
        loading={true}
        loadingRender={() => (
          <div style={{ color: '#007acc' }}>🔄 正在加载图片...</div>
        )}
      />
    </div>
  );
}
