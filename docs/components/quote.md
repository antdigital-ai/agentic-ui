---
title: Quote 引用组件
atomId: Quote
group:
  title: 对话流
  order: 6
---

# Quote 引用组件

Quote 组件是一个现代化的文件引用卡片组件，为代码引用和文档引用场景提供完整的展示解决方案。

## ✨ 核心特性

- 📝 **内容展示**：主视图显示引用内容描述，简洁明了
- 📁 **文件信息**：在详情弹出层中显示文件名和行号范围
- 🔍 **详情弹出**：鼠标移入内容区域动态弹出完整详情，包含文件信息
- 🎨 **现代化设计**：符合设计系统的卡片式布局，内置阴影和圆角
- ♿ **无障碍支持**：完整的键盘导航和屏幕阅读器支持
- 🎯 **类型安全**：完整的 TypeScript 类型定义
- 🌈 **主题友好**：支持自定义样式和 CSS-in-JS 样式系统
- 📱 **智能布局**：动态高度计算，响应式位置调整

## 快速开始

### 基础功能展示

展示 Quote 组件的基础功能，包括文件信息显示、内容预览和关闭操作。

<code src="../demos/quote-demo.tsx">基础用法 - 文件引用与弹出详情</code>

### 在 MarkdownInputField 中使用

在输入框中使用 Quote 组件展示代码引用上下文，通过 `skillMode` 配合 `beforeTools` 属性实现。

<code src="../demos/quote-with-input-demo.tsx" iframe="600">输入框集成 - 代码上下文引用</code>

## 📖 API 参考

### Quote 引用组件

#### 核心属性

| 属性             | 说明                     | 类型                                             | 默认值   |
| ---------------- | ------------------------ | ------------------------------------------------ | -------- |
| fileName         | 文件名                   | `string`                                         | -        |
| lineRange        | 行号范围（可选）         | `string`                                         | -        |
| quoteDescription | 引用内容描述             | `string`                                         | -        |
| popupDetail      | 详细内容（点击查看详情） | `string`                                         | -        |
| popupDirection   | 弹出层方向               | `'left' \| 'right'`                              | `'left'` |
| closable         | 是否显示关闭按钮         | `boolean`                                        | `false`  |
| onClose          | 关闭回调                 | `() => void`                                     | -        |
| onFileClick      | 文件名点击回调           | `(fileName: string, lineRange?: string) => void` | -        |

#### 样式配置

| 属性      | 说明       | 类型                  | 默认值 |
| --------- | ---------- | --------------------- | ------ |
| className | 自定义类名 | `string`              | -      |
| style     | 自定义样式 | `React.CSSProperties` | -      |

### 核心数据类型

#### QuoteProps

```typescript
interface QuoteProps {
  /** 文件名 */
  fileName?: string;
  /** 行号范围（可选） */
  lineRange?: string;
  /** 引用内容描述 */
  quoteDescription: string;
  /** 详细内容（点击查看详情） */
  popupDetail?: string;
  /** 弹出层方向 */
  popupDirection?: 'left' | 'right';
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 文件名点击回调 */
  onFileClick?: (fileName: string, lineRange?: string) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}
```

#### 属性详解

- `fileName` - 文件名称，仅在弹出层中显示，不传时弹出层不显示文件信息
- `lineRange` - 可选的行号范围，如 `'1-10'`，会自动附加到文件名后，仅在弹出层中显示
- `quoteDescription` - 引用的主要内容，在主视图中显示，支持文本截断
- `popupDetail` - 详细内容，提供时会显示弹出层，包含文件信息和详细内容
- `popupDirection` - 弹出层位置方向，`'left'` 表示靠左显示，`'right'` 表示靠右显示，默认为 `'left'`
- `closable` - 控制是否显示右上角关闭按钮
- `onClose` - 关闭按钮的回调函数
- `onFileClick` - 文件名点击回调，当用户点击弹出层中的文件名区域时触发

### 弹出详情系统

当提供 `popupDetail` 属性时，内容区域会变为可点击状态：

#### 功能特点

- **🖱️ 鼠标交互**：鼠标悬停内容区域弹出详情，移出时自动隐藏
- **📐 方向控制**：通过 `popupDirection` 属性控制弹出层的水平位置（左侧或右侧）
- **🎯 智能定位**：弹出层在组件上方显示，避免遮挡内容
- **📱 响应式**：窗口大小变化时自动重新定位
- **🎨 优雅样式**：内置阴影、边框和圆角，符合设计系统

#### 使用示例

```tsx | pure
// 默认左侧弹出
<Quote
  fileName="example.tsx"
  lineRange="1-10"
  quoteDescription="简要描述..."
  popupDetail="详细内容..."
  closable
  onClose={() => console.log('关闭引用')}
  onFileClick={(fileName, lineRange) => {
    console.log('打开文件:', fileName, lineRange);
  }}
/>

// 右侧弹出
<Quote
  fileName="config.json"
  lineRange="5-15"
  quoteDescription="配置文件引用"
  popupDetail="配置详情..."
  popupDirection="right"
  onFileClick={(fileName, lineRange) => {
    console.log('打开文件:', fileName, lineRange);
  }}
/>
```

### 文件名点击功能

当同时提供 `popupDetail` 和 `onFileClick` 属性时，用户可以点击弹出层header中的文件名区域来触发文件跳转：

#### 功能特点

- **📂 文件导航**：点击弹出层中的文件名区域快速跳转到对应文件
- **📍 精确定位**：支持传递行号范围进行精确定位
- **🎯 智能处理**：自动传递文件名和行号信息给回调函数
- **💡 仅弹出层可点击**：文件名点击功能仅在有详情弹出层时可用

#### 使用示例

```tsx | pure
const handleFileClick = (fileName: string, lineRange?: string) => {
  // 跳转到文件
  if (lineRange) {
    // 带行号的精确跳转
    vscode.postMessage({
      command: 'openFile',
      fileName,
      lineRange,
    });
  } else {
    // 普通文件跳转
    window.open(`/editor/${fileName}`);
  }
};

<Quote
  fileName="src/utils/helper.ts"
  lineRange="10-25"
  quoteDescription="工具函数实现"
  popupDetail="详细的函数代码..."
  onFileClick={handleFileClick}
/>;
```

### 弹出方向控制

通过 `popupDirection` 属性可以控制弹出层的水平位置，支持 `'left'`（默认）和 `'right'` 两个方向：

#### 使用场景

- **左侧弹出**：适合页面右侧的引用组件，弹出层向左展开不会超出视口
- **右侧弹出**：适合页面左侧的引用组件，弹出层向右展开避免遮挡内容

#### 示例代码

```tsx | pure
// 左侧弹出（默认行为）
<Quote
  fileName="utils/helper.ts"
  quoteDescription="工具函数"
  popupDetail="详细实现代码..."
  popupDirection="left"  // 可省略，默认值
/>

// 右侧弹出
<Quote
  fileName="config/settings.json"
  quoteDescription="配置文件"
  popupDetail="配置详情..."
  popupDirection="right"
/>
```

### 关闭功能

设置 `closable={true}` 并提供 `onClose` 回调时，会在右上角显示关闭按钮：

```tsx | pure
const handleClose = () => {
  // 处理关闭逻辑
  setQuoteVisible(false);

  // 可选：显示提示信息
  message.info('引用已移除');
};

const handleFileClick = (fileName: string, lineRange?: string) => {
  // 处理文件名点击逻辑
  console.log('跳转到文件:', fileName);
  if (lineRange) {
    console.log('定位到行号:', lineRange);
  }
};

<Quote
  fileName="example.tsx"
  quoteDescription="描述内容"
  closable
  onClose={handleClose}
  onFileClick={handleFileClick}
/>;
```

## 🎯 使用场景

### 在 MarkdownInputField 中展示代码上下文

Quote 组件可以与 `MarkdownInputField` 完美配合，在用户输入时展示相关的代码引用和上下文信息。

#### 实现步骤

**1. 配置技能模式**

通过 `skillMode` 属性启用引用上下文模式：

```tsx | pure
<MarkdownInputField
  skillMode={{
    open: true,
    title: '引用上下文模式',
    closable: true,
  }}
  onSkillModeOpenChange={(open) => {
    setSkillModeOpen(open);
  }}
/>
```

**2. 使用 skillMode.title 添加 Quote 组件**

通过 `skillMode.title` 属性将 Quote 引用作为标题内容：

```tsx | pure
<MarkdownInputField
  placeholder="在这里输入你的问题..."
  onSend={handleSend}
  skillMode={{
    open: true,
    title: (
      <>
        <Quote
          fileName="src/components/UserProfile.tsx"
          lineRange="45-60"
          quoteDescription="用户资料组件的状态管理逻辑"
          popupDetail={userProfileCode}
          popupDirection="left"
        />

        <Quote
          fileName="src/utils/api.ts"
          lineRange="12-25"
          quoteDescription="API请求工具函数"
          popupDetail={apiCode}
          closable
          onClose={() => handleRemoveQuote('api')}
        />

        <Quote
          fileName="src/types/user.ts"
          lineRange="5-15"
          quoteDescription="用户资料的类型定义"
          popupDetail={typeDefinition}
        />
      </>
    ),
    closable: true,
  }}
  onSkillModeOpenChange={(open) => setSkillModeOpen(open)}
/>
```
