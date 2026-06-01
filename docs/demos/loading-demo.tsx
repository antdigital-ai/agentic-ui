import { Loading } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * Loading 组件演示页面
 *
 * 展示 Loading 组件的各种使用方式和功能特性：
 * - 基础用法
 * - 带提示文字
 * - 嵌套模式（带 children）
 * - 进度百分比
 * - 暗色主题
 *
 * @returns 演示页面组件
 */
export default function LoadingDemo() {
  return (
    <div style={{ padding: '24px' }}>
      <h2>基础用法</h2>
      <Loading />

      <h2>带提示文字</h2>
      <Loading tip="加载中..." />

      <h2>自定义尺寸</h2>
      <Loading size={48} tip="大尺寸" />

      <h2>嵌套模式（带 children）</h2>
      <Loading>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>这里是实际内容区域</p>
          <p>加载完成后会显示这些内容</p>
        </div>
      </Loading>

      <h2>进度百分比</h2>
      <Loading percent={75} tip="正在处理..." />

      <h2>自定义指示器</h2>
      <Loading
        indicator={<div style={{ fontSize: 24 }}>⏳</div>}
        tip="自定义指示器"
      />

      <hr style={{ margin: '24px 0' }} />

      <h2>暗色主题演示</h2>
      <div
        style={{
          background: '#141414',
          padding: '24px',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#fff', marginBottom: '16px' }}>基础用法</h3>
        <Loading />

        <h3 style={{ color: '#fff', marginTop: '24px', marginBottom: '16px' }}>
          带提示文字
        </h3>
        <Loading tip="加载中..." />

        <h3 style={{ color: '#fff', marginTop: '24px', marginBottom: '16px' }}>
          嵌套模式
        </h3>
        <Loading>
          <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
            <p>这里是实际内容区域</p>
            <p>加载完成后会显示这些内容</p>
          </div>
        </Loading>

        <h3 style={{ color: '#fff', marginTop: '24px', marginBottom: '16px' }}>
          进度百分比
        </h3>
        <Loading percent={60} tip="正在处理..." />
      </div>
    </div>
  );
}
