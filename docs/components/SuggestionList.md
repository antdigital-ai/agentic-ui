---
title: SuggestionList 追问建议
atomId: SuggestionList
group:
  title: 对话流
  order: 3
---

# SuggestionList 追问建议

一个轻量的追问建议列表组件，支持图标、提示、不同布局与三种样式类型。

## 代码演示

<code src="../demos/suggestion-list-basic.tsx">基础用法</code>

## API

### SuggestionList

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| className | 自定义类名 | `string` | - | - |
| style | 自定义样式 | `React.CSSProperties` | - | - |
| items | 建议项列表 | `SuggestionItem[]` | `[]` | - |
| onItemClick | 点击回调（无 item.onClick 时） | `(value: string) => void \| Promise<void>` | - | - |
| layout | 布局 | `'vertical' \| 'horizontal'` | `'vertical'` | - |
| maxItems | 最大显示数量 | `number` | `6` | - |
| type | 样式类型 | `'basic' \| 'transparent' \| 'white'` | `'basic'` | - |
| showMore | 左上角"搜索更多"入口配置 | `{ enable: boolean; onClick?: () => void; text?: string; icon?: React.ReactNode }` | - | - |

### SuggestionItem

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| key | 唯一键 | `React.Key` | - | - |
| text | 展示文本 | `string` | - | - |
| icon | 前置图标 | `React.ReactNode` | - | - |
| tooltip | 悬浮提示 | `string` | - | - |
| disabled | 是否禁用 | `boolean` | `false` | - |
| onClick | 自定义点击回调 | `(text: string) => void \| Promise<void>` | - | - |
| actionIcon | 右侧动作图标/箭头 | `React.ReactNode` | - | - |

## 样式类型说明

- basic：
  - background: `var(--color-gray-bg-card-light)`
  - hover: `var(--color-gray-control-fill-active)`
- transparent：
  - background: `var(--color-gray-bg-transparent)`
  - hover: `var(--color-gray-control-fill-hover)`
- white：
  - background: `var(--color-gray-bg-card-white)`
  - box-shadow: `var(--shadow-control-base)`
  - hover: `background` 保持白色，`box-shadow: var(--shadow-control-lg)`
