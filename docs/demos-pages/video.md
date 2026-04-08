---
nav:
  title: Demo
  order: 5
group:
  title: 通用
  order: 11
---

# 视频支持

Markdown Editor 支持在 Markdown 中嵌入视频元素，支持多种视频格式和属性。

## 基本用法

### 简单视频标签

```html
<video src="video.mp4" controls />
```

### 带完整属性的视频

```html
<video
  src="video.mp4"
  controls
  autoplay
  loop
  muted
  poster="poster.jpg"
  width="640"
  height="360"
></video>
```

### 使用 source 标签的视频

```html
<video controls width="600">
  <source src="https://example.com/video.mp4" type="video/mp4" />
  movie.mp4
</video>
```

### 多个 source 标签的视频

```html
<video controls autoplay loop muted width="800" height="450">
  <source src="https://example.com/video.mp4" type="video/mp4" />
  <source src="https://example.com/video.webm" type="video/webm" />
  Your browser does not support the video tag.
</video>
```

## 支持的属性

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| `src` | 视频源 URL | `string` | - | - |
| `controls` | 是否显示播放控件 | `boolean` | - | - |
| `autoplay` | 是否自动播放 | `boolean` | - | - |
| `loop` | 是否循环播放 | `boolean` | - | - |
| `muted` | 是否静音 | `boolean` | - | - |
| `poster` | 视频封面图片 URL | `string` | - | - |
| `width` | 视频宽度（像素） | `number` | - | - |
| `height` | 视频高度（像素） | `number` | - | - |
| `alt` | 视频描述文本 | `string` | - | - |

## 特殊格式支持

### 带查询参数的URL

```html
<video controls width="600">
  <source
    src="https://example.com/video%20with%20spaces.mp4?param=value&another=param"
    type="video/mp4"
  />
</video>
```

### 阿里云OSS视频

```html
<video controls width="600">
  <source
    src="https://aicomm-dev.oss-cn-shanghai.aliyuncs.com/aico/boss/transfer/wrong_question/Fa892bfbe407045efa56813498df8e508.video/mp4?Expires=1755941235&OSSAccessKeyId=LTAI5tKiBhsKfhwgbsFbC3CL&Signature=0tSi7oBjEXZHjpkSjLCRbkUpmIg%3D"
    type="video/mp4"
  />
  movie.mp4
</video>
```

## 渲染特性

- 视频元素会自动添加圆角和阴影效果
- 支持预加载元数据以提升用户体验
- 自动处理视频加载错误
- 响应式设计，支持不同屏幕尺寸

## 注意事项

1. 视频URL中的特殊字符会被自动解码
2. 当前版本主要支持MP4格式视频
3. 视频加载失败时会在控制台输出警告信息
4. 视频元素在编辑模式下支持调整大小

## 示例

```markdown
# 视频演示

这是一个简单的视频：

<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls width="400"></video>

这是一个带source标签的视频：

<video controls width="600">
<source src="https://www.w3schools.com/html/mov_bbb.mp4 type="video/mp4" />
movie.mp4
</video>
```

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';

const VideoDemo = () => {
  return (
    <MarkdownEditor
      readonly
      initValue={`
# 视频演示

这是一个简单的视频：

<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls width="400"></video>

这是一个带source标签的视频：

<video controls width="600">
<source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
movie.mp4
</video>
`}
    />
  );
};

export default VideoDemo;
```
