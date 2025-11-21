import React from 'react';
import { VisualList, VisualListItem } from '../../src/Components/VisualList';

const DefaultIconDemo: React.FC = () => {
  const data: VisualListItem[] = [
    {
      id: '1',
      src: 'invalid-url.jpg', // 无效URL，会显示默认图标
      alt: '无效图片',
      title: '这张图片会显示默认浏览器图标',
    },
    {
      id: '2',
      src: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=Valid',
      alt: '有效图片',
      title: '这张图片会正常显示',
    },
    {
      id: '3',
      src: 'another-invalid-url.png', // 另一个无效URL
      alt: '另一个无效图片',
      title: '这张也会显示默认图标',
    },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <h3>VisualList 默认图标演示</h3>
      <p>当图片加载失败时，会自动显示浏览器图标作为默认图标。</p>

      <div style={{ marginBottom: '20px' }}>
        <h4>默认形状</h4>
        <VisualList
          data={data}
          imageStyle={{ width: 60, height: 60 }}
          description="包含无效和有效图片的列表"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>圆形形状</h4>
        <VisualList
          data={data}
          shape="circle"
          imageStyle={{ width: 60, height: 60 }}
          description="圆形头像样式，默认图标也会是圆形"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>带边框样式</h4>
        <VisualList
          data={data}
          variant="outline"
          imageStyle={{ width: 60, height: 60 }}
          description="带边框的列表样式"
        />
      </div>
    </div>
  );
};

export default DefaultIconDemo;
