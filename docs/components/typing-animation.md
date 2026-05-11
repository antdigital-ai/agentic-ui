---
title: TypingAnimation 打字机动画
atomId: TypingAnimation
group:
  title: 通用
  order: 5
---

# TypingAnimation 打字机动画

`TypingAnimation` 提供逐字符的打字机效果，支持单条文本、词语轮播、循环、可配置光标样式。底层为 `setTimeout` 推进 + IntersectionObserver 控制启动，不依赖 framer-motion。

## 何时使用

- 需要模拟「智能体逐字回答」的视觉效果
- 需要在 Hero / 引导区轮播多句标语
- 需要可视化的输入光标（line / block / underscore）

> 与 [TextAnimate](./text-animate) 的区别：`TextAnimate` 整段同时入场（按词 / 字符错峰），`TypingAnimation` 逐字符依次出现并支持删除回退、循环切换。

## 代码演示

<code src="../demos/typing-animation.tsx">基础打字机、词语轮播与光标样式</code>

## API

### TypingAnimationProps

| 属性        | 说明                                                                       | 类型                                | 默认值          | 版本 |
| ----------- | -------------------------------------------------------------------------- | ----------------------------------- | --------------- | ---- |
| children    | 单条字符串内容（与 `words` 二选一）                                        | `React.ReactNode`                   | -               | -    |
| words       | 多句循环内容；优先级高于 `children`                                        | `string[]`                          | -               | -    |
| as          | 渲染的元素类型                                                             | `React.ElementType`                 | `'span'`        | -    |
| duration    | 单字符默认间隔（毫秒）；既影响 `typeSpeed` 也作为 `deleteSpeed` 的默认基准 | `number`                            | `100`           | -    |
| typeSpeed   | 输入字符间隔（毫秒），覆盖 `duration`                                      | `number`                            | `duration`      | -    |
| deleteSpeed | 删除字符间隔（毫秒）                                                       | `number`                            | `typeSpeed / 2` | -    |
| delay       | 动画首次启动延迟（毫秒）                                                   | `number`                            | `0`             | -    |
| pauseDelay  | 单条完成后停顿时长（毫秒）                                                 | `number`                            | `1000`          | -    |
| loop        | 是否循环                                                                   | `boolean`                           | `false`         | -    |
| startOnView | 是否仅在视口可见时启动动画                                                 | `boolean`                           | `true`          | -    |
| showCursor  | 是否显示光标                                                               | `boolean`                           | `true`          | -    |
| blinkCursor | 光标是否闪烁                                                               | `boolean`                           | `true`          | -    |
| cursorStyle | 光标样式                                                                   | `'line' \| 'block' \| 'underscore'` | `'line'`        | -    |
| className   | 自定义类名                                                                 | `string`                            | -               | -    |

> 所有 `React.HTMLAttributes<HTMLElement>` 上的属性（除 `children`）也会透传到底层元素。

## 行为说明

1. **`children` vs `words`**：传 `words` 时进入「多句轮播」模式（输入 → 停顿 → 删除 → 切换下一句），不传时使用 `children` 单条输入。
2. **`loop`**：仅在多句模式或希望最后一句反复输入时使用；单句 + `loop={false}` 时，到达末尾即停止并隐藏光标。
3. **`startOnView`**：默认仅在元素至少 30% 可见时启动；测试或 SSR 环境下默认视为可见，避免动画永不开始。
4. **光标自动隐藏**：当动画整体完成（非循环、最后一句、已输入到结尾且非删除阶段）时，光标会自动隐藏。
