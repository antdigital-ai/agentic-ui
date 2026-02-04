import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const VideoDemo: React.FC = () => {
  const markdown = `
# 视频支持演示

## 基本视频标签
<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls width="400"></video>

## 带source标签的视频
<video controls width="600">
<source src="https://aicomm-dev.oss-cn-shanghai.aliyuncs.com/aico/boss/transfer/wrong_question/Fa892bfbe407045efa56813498df8e508.video/mp4?Expires=1755941235&OSSAccessKeyId=LTAI5tKiBhsKfhwgbsFbC3CL&Signature=0tSi7oBjEXZHjpkSjLCRbkUpmIg%3D" type="video/mp4">
movie.mp4
</video>

## 自闭合视频标签
<video src="test.mp4" controls />

## 带完整属性的视频
<video src="test.mp4" controls autoplay loop muted poster="poster.jpg" width="640" height="360"></video>

## 多个source的视频
<video controls autoplay loop muted width="800" height="450">
<source src="https://example.com/video.mp4" type="video/mp4">
<source src="https://example.com/video.webm" type="video/webm">
Your browser does not support the video tag.
</video>
`;

  return (
    <div style={{ padding: '12px' }}>
      <h1>视频支持功能演示</h1>
      <MarkdownEditor
        initValue={markdown}
        toc={false}
        onChange={() => {}}
        readonly
        reportMode
        style={{ width: '100%' }}
      />

      <div style={{ marginTop: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>initValue</strong>: 编辑器的初始内容值，包含视频标签的
            Markdown 内容
          </li>
          <li>
            <strong>toc</strong>: 是否显示目录，设置为 false 隐藏目录
          </li>
          <li>
            <strong>onChange</strong>: 内容变化时的回调函数
          </li>
          <li>
            <strong>readonly</strong>: 只读模式，禁用编辑功能
          </li>
          <li>
            <strong>reportMode</strong>: 报告模式，启用只读状态
          </li>
          <li>
            <strong>style</strong>: 编辑器容器的样式对象
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VideoDemo;
