---
title: History 历史记录
atomId: History
group:
  title: 对话流
  order: 3
---

# History 历史记录

History 组件用于显示和管理聊天历史记录，支持两种显示模式：下拉菜单模式和独立菜单模式。组件提供历史会话的查看、选择和删除功能。

## 代码演示

### 基础用法

展示基本的历史记录下拉菜单功能。

<code src="../demos/history-basic.tsx">基础用法</code>

### 独立菜单模式

使用 `standalone` 属性直接显示历史记录菜单。

<code src="../demos/history-standalone.tsx">独立菜单模式</code>

### 自定义日期格式化和分组

使用 `customDateFormatter` 和 `groupBy` 属性自定义日期显示和分组逻辑。

<code src="../demos/history-custom.tsx">自定义日期格式化和分组</code>

### 自定义额外内容

使用 `extra` 属性为每个历史记录项添加自定义内容。

<code src="../demos/history-extra.tsx">自定义额外内容</code>

### Agent 模式

启用 Agent 模式后，支持搜索、收藏、多选与加载更多等增强能力。

<code src="../demos/history-agent-mode-demo.tsx">Agent 模式</code>

<code src="../demos/history-task-demo.tsx">Agent 任务模式</code>

### ActionRef 外部控制

使用 `actionRef` 可以外部触发历史记录重新加载。

<code src="../demos/history-actionRef-demo.tsx">ActionRef 外部控制</code>

### 空状态渲染与搜索触发方式

使用 `emptyRender` 自定义空状态显示，使用 `searchOptions.trigger` 配置搜索触发方式。

<code src="../demos/history-empty-render.tsx">空状态渲染与搜索触发</code>

## API

### History

| 参数                      | 说明                                               | 类型                                                                               | 默认值  |
| ------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- | ------- |
| agentId                   | 代理ID，用于获取历史记录                           | `string`                                                                           | -       |
| sessionId                 | 会话ID，变更时会触发数据重新获取                   | `string`                                                                           | -       |
| request                   | 请求函数，用于获取历史数据                         | `(params: { agentId: string }) => Promise<HistoryDataType[]>`                      | -       |
| standalone                | 是否以独立模式显示                                 | `boolean`                                                                          | `false` |
| onInit                    | 组件初始化时的回调函数                             | `() => void`                                                                       | -       |
| onShow                    | 组件显示时的回调函数                               | `() => void`                                                                       | -       |
| onSelected _(deprecated)_ | 选择历史记录项时的回调函数，返回完整的历史记录数据 | `(item: HistoryDataType) => void`                                                  | -       |
| onDeleteItem              | 删除历史记录项时的回调函数                         | `(sessionId: string) => void`                                                      | -       |
| customDateFormatter       | 自定义日期格式化函数                               | `(date: number \| string \| Date) => string`                                       | -       |
| groupBy                   | 自定义分组函数                                     | `(item: HistoryDataType) => string`                                                | -       |
| extra                     | 自定义额外内容渲染函数                             | `(item: HistoryDataType) => React.ReactElement`                                    | -       |
| sessionSort               | 自定义排序函数或禁用排序                           | `((pre: HistoryDataType, current: HistoryDataType) => number \| boolean) \| false` | -       |
| actionRef                 | 外部操作引用，用于触发 reload 等功能               | `React.MutableRefObject<{ reload: () => void } \| null>`                           | -       |
| emptyRender               | 空状态渲染函数，当历史记录为空时显示               | `() => React.ReactNode`                                                            | -       |
| agent                     | Agent 模式配置，详见 Agent 配置说明                | `AgentConfig`                                                                      | -       |
| slots                     | 插槽配置                                           | `{ beforeHistoryList?: (list: HistoryDataType[]) => React.ReactNode }`             | -       |
| loading                   | 加载状态，显示在 GroupMenu 区域                    | `boolean`                                                                          | `false` |

### HistoryDataType

| 参数            | 说明         | 类型               | 默认值  |
| --------------- | ------------ | ------------------ | ------- |
| id              | 会话记录ID   | `number \| string` | -       |
| tenantId        | 租户ID       | `string`           | -       |
| sessionTitle    | 会话标题     | `React.ReactNode`  | -       |
| agentId         | AI代理ID     | `string`           | -       |
| sessionId       | 会话唯一标识 | `string`           | -       |
| gmtCreate       | 记录创建时间 | `number \| string` | -       |
| gmtLastConverse | 最近对话时间 | `number \| string` | -       |
| isFavorite      | 是否收藏     | `boolean`          | `false` |
| isSelected      | 是否选中     | `boolean`          | `false` |

### HistoryChatType

| 参数            | 说明         | 类型                                                                                                        | 默认值 |
| --------------- | ------------ | ----------------------------------------------------------------------------------------------------------- | ------ |
| feedback        | 问答对状态   | `'median' \| 'thumbsUp' \| 'thumbsDown'`                                                                    | -      |
| tenantId        | 租户ID       | `string`                                                                                                    | -      |
| agentId         | AI代理ID     | `string`                                                                                                    | -      |
| questionContent | 提问内容     | `{ role?: string; content?: string; contentType?: string }`                                                 | -      |
| answerContent   | 回答内容     | `{ role?: string; content?: string; contentType?: string; white_box_process?: WhiteBoxProcessInterface[] }` | -      |
| sessionId       | 会话唯一标识 | `string`                                                                                                    | -      |
| clientId        | 客户ID       | `string`                                                                                                    | -      |
| gmtCreate       | 记录创建时间 | `string \| number`                                                                                          | -      |

## 功能特性

### 显示模式

- **下拉菜单模式**（默认）：显示为一个可点击的历史图标，点击后显示下拉菜单
- **独立菜单模式**：直接显示为菜单列表，适用于侧边栏等场景

### 数据分组

- 默认按日期分组（今日、昨日、一周内、更早）
- 支持自定义分组逻辑
- 每组内按时间倒序排列

### 交互功能

- **查看历史**：点击历史记录项可切换到对应会话
- **删除记录**：鼠标悬停显示删除按钮，支持确认删除
- **自定义操作**：通过 `extra` 属性添加自定义按钮或标签

### 样式定制

组件使用了 Ant Design 的 Menu 组件，可以通过以下方式定制样式：

```tsx | pure
// 通过 ConfigProvider 定制主题
<ConfigProvider
  theme={{
    components: {
      Menu: {
        colorBgTextHover: '#F0F2F5',
        itemBorderRadius: 2,
        itemSelectedBg: '#F0F2F5',
      },
    },
  }}
>
  <History {...props} />
</ConfigProvider>
```

### 国际化支持

组件支持国际化，通过 `BubbleConfigContext` 提供以下文案：

```ts | pure
{
  'chat.history': '历史记录',
  'chat.history.delete': '删除',
  'chat.history.delete.popconfirm': '确定删除该消息吗？'
}
```

### Agent 配置

通过 `agent` 属性启用并配置 Agent 模式。组件会根据提供的回调函数自动显示对应的功能按钮：

| 属性              | 类型                                               | 默认值  | 说明                                |
| ----------------- | -------------------------------------------------- | ------- | ----------------------------------- |
| enabled           | `boolean`                                          | `false` | 是否启用 agent 模式                 |
| onSearch          | `(keyword: string) => void`                        | -       | 搜索回调函数                        |
| onFavorite        | `(sessionId: string, isFavorite: boolean) => void` | -       | 收藏/取消收藏回调                   |
| onSelectionChange | `(selectedIds: string[]) => void`                  | -       | 多选变更回调                        |
| onLoadMore        | `() => void`                                       | -       | 加载更多回调                        |
| onNewChat         | `() => void`                                       | -       | 新对话回调函数                      |
| loadingMore       | `boolean`                                          | `false` | 是否正在加载更多                    |
| runningId         | `string[]`                                         | -       | 正在运行的记录 ID 列表              |
| searchOptions     | `SearchOptions`                                    | -       | 搜索框配置，详见 SearchOptions 说明 |

### SearchOptions 配置

搜索框相关配置选项：

| 属性        | 类型                  | 默认值     | 说明                                                                |
| ----------- | --------------------- | ---------- | ------------------------------------------------------------------- |
| placeholder | `string`              | -          | 搜索输入框 placeholder 文案                                         |
| text        | `string`              | -          | 未展开时的默认文本                                                  |
| trigger     | `'change' \| 'enter'` | `'change'` | 搜索触发方式：'change' 为实时搜索（防抖 360ms），'enter' 为回车触发 |

## 注意事项

1. **请求函数**：`request` 函数必须返回 `Promise<HistoryDataType[]>`，用于获取历史数据
2. **会话ID**：`sessionId` 变更时会自动重新获取数据
3. **删除功能**：需要提供 `onDeleteItem` 回调函数才能启用删除功能
4. **独立模式**：在独立模式下，组件直接渲染菜单，不包含下拉触发器
5. **性能优化**：大量历史记录时建议实现虚拟滚动或分页加载
6. **功能按钮**：新对话和加载更多按钮会根据是否提供对应的回调函数自动显示
7. **Loading 状态**：搜索、加载更多、新对话、收藏和删除功能都有内置的 loading 状态管理，无需外部配置
8. **空状态渲染**：通过 `emptyRender` 可以自定义历史记录为空时的显示内容，适用于独立模式和下拉菜单模式
9. **搜索触发方式**：默认为实时搜索（`change`），输入时带 360ms 防抖；也可设置为回车触发（`enter`），减少搜索请求次数
10. **全局加载状态**：通过 `loading` 属性可以在 GroupMenu 区域显示加载动画，适用于初始化加载或刷新数据时的状态展示
