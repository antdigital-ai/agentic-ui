---
title: TextLoading 文字加载
atomId: TextLoading
group:
  title: 对话流
  order: 3
---

# TextLoading 文字加载

一个轻量级的文字加载组件，通过纯CSS动画展示优雅的光泽流动效果。

## 代码演示

<code src="../demos/textLoading-basic.tsx">基础用法</code>

<code src="../demos/textLoading-custom.tsx">自定义文本和样式</code>

<code src="../demos/textLoading-theme.tsx">主题切换</code>

<code src="../demos/textLoading-dark.tsx">暗色主题</code>

<code src="../demos/textLoading-disabled.tsx">禁用动画</code>

## API

### TextLoading

| 参数      | 说明                                                    | 类型                  | 默认值         |
| --------- | ------------------------------------------------------- | --------------------- | -------------- |
| text      | 要显示的文本内容                                        | `string`              | `"Loading..."` |
| disabled  | 是否禁用闪光动画                                        | `boolean`             | `false`        |
| theme     | 主题模式，`light` 适用于白色背景，`dark` 适用于黑色背景 | `'light' \| 'dark'`   | `'light'`      |
| className | 容器类名                                                | `string`              | -              |
| style     | 容器样式                                                | `React.CSSProperties` | -              |
| fontSize  | 字体大小                                                | `number \| string`    | -              |

### 特性

- ✨ **纯CSS动画**: 使用CSS渐变和动画实现，无需额外依赖
- 🎨 **优雅效果**: 光泽从右到左流动，营造高级的视觉体验
- ⚡ **轻量高效**: 不依赖Lottie或其他动画库，性能优异
- 🌓 **主题适配**: 支持亮色和暗色主题，自动适配不同背景
- 🔧 **灵活定制**: 支持自定义文本、字体大小和样式
- ♿ **无障碍友好**: 内置ARIA属性，提供良好的可访问性
- 🎛️ **动画控制**: 支持禁用动画，适应不同使用场景

### 动画细节

组件使用CSS线性渐变和背景定位动画实现闪光效果：

**亮色主题（light）**：

- **文字颜色**: 半透明黑色 (#00000066)
- **光泽效果**: 从透明黑色到亮白色(0.9透明度)再到透明黑色
- **适用场景**: 白色或浅色背景

**暗色主题（dark）**：

- **文字颜色**: 半透明白色 (#ffffff40)
- **光泽效果**: 从透明白色到亮白色(0.8透明度)再到透明白色
- **适用场景**: 黑色或深色背景

**通用动画参数**：

- **渐变角度**: 120度，创造斜向流动效果
- **动画周期**: 5秒完成一次完整循环
- **背景尺寸**: 200% × 100%，确保流畅的过渡效果
- **背景裁剪**: 使用 `background-clip: text` 将渐变限制在文字内

### 使用场景

- **加载提示**: 在数据加载时显示友好的等待文字
- **状态指示**: 表示某个操作正在进行中
- **占位内容**: 作为内容加载前的占位提示
- **品牌展示**: 为品牌文字添加动态效果
