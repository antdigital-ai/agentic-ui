---
title: VisualList 视觉列表
atomId: VisualList
group:
  title: 通用
  order: 1
---

# VisualList 视觉列表

一个灵活的图片列表组件，支持多种尺寸、形状和自定义渲染。基于 css-in-js 样式系统，提供良好的主题支持和样式隔离。

## 代码演示

<code src="../demos/visual-list.tsx">基础用法</code>

## API

### VisualList

| 参数          | 说明                           | 类型                                                       | 默认值          |
| ------------- | ------------------------------ | ---------------------------------------------------------- | --------------- |
| data          | 图片数据数组（必需）           | `VisualListItem[]`                                         | -               |
| className     | 自定义 CSS 类名                | `string`                                                   | -               |
| style         | 自定义内联样式                 | `React.CSSProperties`                                      | -               |
| filter        | 数据过滤函数                   | `(item: VisualListItem) => boolean`                        | `() => true`    |
| emptyRender   | 空状态自定义渲染函数           | `() => React.ReactNode`                                    | -               |
| renderItem    | 自定义列表项渲染函数           | `(item: VisualListItem, index: number) => React.ReactNode` | -               |
| loading       | **已废弃**，请使用 `isLoading` | `boolean`                                                  | `false`         |
| isLoading     | 是否显示加载状态               | `boolean`                                                  | `false`         |
| loadingRender | 加载状态自定义渲染函数         | `() => React.ReactNode`                                    | -               |
| itemStyle     | 列表项自定义样式               | `React.CSSProperties`                                      | -               |
| imageStyle    | 图片自定义样式                 | `React.CSSProperties`                                      | -               |
| linkStyle     | 链接自定义样式                 | `React.CSSProperties`                                      | -               |
| shape         | 图片形状                       | `'default' \| 'circle'`                                    | `'default'`     |
| prefixCls     | 样式前缀类名                   | `string`                                                   | `'visual-list'` |
| variant       | 组件变体                       | `'default' \| 'outline' \| 'borderless'`                   | `'default'`     |
| description   | 描述文字                       | `string`                                                   | -               |

### VisualListItem

| 参数  | 说明                           | 类型     | 默认值 |
| ----- | ------------------------------ | -------- | ------ |
| id    | 唯一标识符                     | `string` | -      |
| src   | 图片地址（必需）               | `string` | -      |
| alt   | 图片替代文本                   | `string` | -      |
| title | 图片标题                       | `string` | -      |
| href  | 链接地址，如果提供则图片可点击 | `string` | -      |

## 使用示例

### 基础用法

```tsx | pure
import { VisualList, VisualListItem } from '@ant-design/agentic-ui';

const imageData: VisualListItem[] = [
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
];

<VisualList data={imageData} />;
```

### 不同形状

```tsx | pure
// 圆形头像
<VisualList data={imageData} shape="circle" />

// 方形头像
<VisualList data={imageData} shape="default" />
```

### 组件变体

```tsx | pure
// 带边框
<VisualList data={imageData} variant="outline" />

// 无边框
<VisualList data={imageData} variant="borderless" />
```

### 带描述文字

```tsx | pure
<VisualList data={imageData} description="这里是列表的描述信息" />
```

### 数据过滤

```tsx | pure
// 只显示有链接的图片
<VisualList data={imageData} filter={(item) => item.href !== undefined} />
```

### 自定义渲染

```tsx | pure
<VisualList
  data={imageData}
  renderItem={(item, index) => (
    <li key={item.id || index} style={{ padding: '8px' }}>
      <img src={item.src} alt={item.alt} style={{ width: 50, height: 50 }} />
      <span>{item.title}</span>
    </li>
  )}
/>
```

### 空状态和加载状态

```tsx | pure
// 空状态
<VisualList
  data={[]}
  emptyRender={() => <div>暂无图片数据</div>}
/>

// 加载状态
<VisualList
  data={[]}
  isLoading={true}
  loadingRender={() => <div>正在加载...</div>}
/>
```

## 样式定制

组件使用了以下的样式变量，可以通过 CSS-in-JS 进行样式定制：

```ts
{
  // 主容器样式
  display: 'flex',
  flexFlow: 'wrap',
  gap: '8px',

  // 列表项样式
  itemBorderRadius: '8px',
  itemBorder: '1px solid #ddd',
  itemHoverBorderColor: '#007acc',
  itemHoverShadow: '0 2px 8px rgba(0, 122, 204, 0.15)',

  // 图片尺寸
  imageSize: '24px',

  // 链接样式
  linkFocusOutline: '2px solid #007acc',
  linkFocusOutlineOffset: '2px'
}
```

## 设计理念

- **灵活性**: 支持多种尺寸、形状和自定义渲染
- **可访问性**: 提供完整的键盘导航和屏幕阅读器支持
- **性能**: 基于 css-in-js 的样式隔离，避免样式冲突
- **主题支持**: 与项目的主题系统完全集成
- **类型安全**: 完整的 TypeScript 类型定义
