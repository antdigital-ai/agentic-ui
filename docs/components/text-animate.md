---
title: TextAnimate 文本入场动画
atomId: TextAnimate
group:
  title: 通用
  order: 5
---

# TextAnimate 文本入场动画

`TextAnimate` 用于为文本提供按词 / 按字符 / 按行的入场动画，常用于 AI 回答的「优雅出现」效果。底层为纯 CSS 动画 + IntersectionObserver，不依赖 framer-motion。

## 何时使用

- 智能体回答出现时希望有「优雅入场」而非生硬一次渲染
- 希望在视口可见时再触发动画
- 希望按字符 / 按词 / 按行控制入场粒度

> 与 [TypingAnimation](./typing-animation) 的区别：`TypingAnimation` 是**逐字打字机**效果（可循环、可删除），`TextAnimate` 是**整段一次性入场**（每段元素以错峰 stagger 同时入场）。

## 代码演示

<code src="../demos/text-animate-playground.tsx">API Playground - 全部 animation × by × duration</code>

<code src="../demos/text-animate.tsx">不同入场动画与拆分模式</code>

## API

### TextAnimateProps

| 属性             | 说明                                                                        | 类型                                                                                                                                        | 默认值     | 版本 |
| ---------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---- |
| children         | 文本内容（推荐传字符串）                                                    | `React.ReactNode`                                                                                                                           | -          | -    |
| as               | 渲染的元素类型                                                              | `React.ElementType`                                                                                                                         | `'p'`      | -    |
| by               | 拆分模式                                                                    | `'text' \| 'word' \| 'character' \| 'line' \| 'mix'`                                                                                        | `'word'`   | -    |
| animation        | 入场动画预设                                                                | `'fadeIn' \| 'blurIn' \| 'blurInUp' \| 'blurInDown' \| 'slideUp' \| 'slideDown' \| 'slideLeft' \| 'slideRight' \| 'scaleUp' \| 'scaleDown'` | `'fadeIn'` | -    |
| duration         | 动画持续时间（秒）                                                          | `number`                                                                                                                                    | `0.3`      | -    |
| delay            | 动画整体延迟（秒）                                                          | `number`                                                                                                                                    | `0`        | -    |
| variants         | 自定义 framer-motion 风格 variants（兼容历史 API，新实现下退化为 `fadeIn`） | `Record<string, Record<string, unknown>>`                                                                                                   | -          | -    |
| startOnView      | 是否仅在视口可见时触发动画                                                  | `boolean`                                                                                                                                   | `true`     | -    |
| once             | 触发后是否不再回退（与 `startOnView` 配合）                                 | `boolean`                                                                                                                                   | `false`    | -    |
| accessible       | 是否启用无障碍属性（`aria-label`）                                          | `boolean`                                                                                                                                   | `true`     | -    |
| segmentClassName | 单个 segment 的额外类名                                                     | `string`                                                                                                                                    | -          | -    |
| className        | 容器自定义类名                                                              | `string`                                                                                                                                    | -          | -    |

> 所有 `React.HTMLAttributes<HTMLElement>` 上的属性（除 `children`）也会透传到底层元素。

## 行为说明

1. **stagger 节奏**：默认情况下每个 segment 的延迟为 `delay + i * (duration / segments.length)`；自定义 `variants` 时按拆分粒度的预设步长（character: 30ms, word/line/text/mix: 50–60ms）执行。
2. **`startOnView`**：默认仅在元素至少 50% 可见时触发动画；如果希望立即播放可设 `startOnView={false}`。
3. **`once`**：默认 `false`，元素离开视口后再次进入会重新触发；如果希望只播放一次设为 `true`。
4. **无障碍**：当 `accessible` 为 `true` 且 `children` 是字符串时，容器会带上 `aria-label`，每个 segment `aria-hidden`，避免读屏器逐字读出。

## 工具函数

| 名称                            | 说明                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| `resolveSegments(children, by)` | 将 `children` 按指定模式拆分为 segments 数组，可在自定义动画组件中复用。 |
