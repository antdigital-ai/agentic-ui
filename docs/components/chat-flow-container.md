---
title: ChatLayout - 对话流容器组件
atomId: ChatLayout
group:
  title: 布局
  order: 2
---

# 对话流容器组件

该组件提供了一个完整的对话流容器，包含头部区域、内容区域和底部区域。

## 基础用法

<code src="../demos/ChatFlowContainer/index.tsx" iframe=620></code>

## API 参考

### ChatLayoutProps

| 属性          | 类型                | 默认值    | 描述                                           |
| ------------- | ------------------- | --------- | ---------------------------------------------- |
| header        | LayoutHeaderConfig  | -         | 头部配置对象，详见下方 LayoutHeaderConfig      |
| children      | ReactNode           | -         | 内容区域的自定义内容                           |
| footer        | ReactNode           | -         | 底部区域的自定义内容                           |
| footerHeight  | number              | 90        | 底部区域的高度（单位：px）                     |
| scrollBehavior | 'smooth' \| 'auto' | 'smooth'  | 滚动行为，'smooth' 为平滑滚动，'auto' 为立即滚动 |
| className     | string              | -         | 自定义类名                                     |
| style         | React.CSSProperties | -         | 自定义样式                                     |

### LayoutHeaderConfig

| 属性                | 类型                          | 默认值 | 描述                                                           |
| ------------------- | ----------------------------- | ------ | -------------------------------------------------------------- |
| title               | string                        | -      | 头部标题文本                                                   |
| showShare           | boolean                       | true   | 是否显示分享按钮                                               |
| leftCollapsible     | boolean                       | true   | 左侧是否可折叠                                                 |
| rightCollapsible    | boolean                       | false  | 右侧是否可折叠                                                 |
| leftCollapsed       | boolean                       | -      | 左侧折叠状态（受控模式）                                       |
| rightCollapsed      | boolean                       | -      | 右侧折叠状态（受控模式）                                       |
| leftDefaultCollapsed | boolean                       | false  | 左侧默认折叠状态（非受控模式）                                 |
| rightDefaultCollapsed | boolean                       | false  | 右侧默认折叠状态（非受控模式）                                 |
| onLeftCollapse      | (collapsed: boolean) => void  | -      | 左侧折叠按钮点击事件回调                                       |
| onRightCollapse     | (collapsed: boolean) => void  | -      | 右侧折叠按钮点击事件回调                                       |
| onShare             | () => void                    | -      | 分享按钮点击事件回调                                           |
| leftExtra           | ReactNode                     | -      | 自定义左侧额外内容                                             |
| rightExtra          | ReactNode                     | -      | 自定义右侧额外内容                                             |
| className           | string                        | -      | 自定义类名                                                     |

### ChatLayoutRef

通过 `ref` 可以访问以下方法和属性：

| 属性/方法      | 类型                          | 描述                           |
| ------------- | ----------------------------- | ------------------------------ |
| scrollContainer | HTMLDivElement \| null      | 滚动容器的 DOM 引用            |
| scrollToBottom | () => void                   | 手动滚动到底部的方法（立即滚动） |


## 设计理念

1. 组件需要父容器有明确的高度才能正常显示
2. 内容区域支持自动滚动，建议配合虚拟滚动使用大量数据
3. 所有按钮都支持键盘导航和屏幕阅读器
4. 支持受控和非受控两种模式，灵活适应不同使用场景
5. 通过 ref 可以访问滚动容器和手动控制滚动行为
