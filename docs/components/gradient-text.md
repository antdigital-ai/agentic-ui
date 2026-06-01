---
title: GradientText 渐变文字
atomId: GradientText
group:
  title: 通用
  order: 5
---

# GradientText 渐变文字

`GradientText` 是一个简单的文字渐变动画组件，常用于品牌标题、Hero 区文案、AI 主题强调等场景。它仅做样式渲染，不会改变文本语义。

## 何时使用

- 需要为标题或重点文案添加多色横向渐变与流动动画
- 需要快速实现「AI 风格」标题，无需自己写关键帧动画

## 代码演示

<code src="../demos/gradient-text-playground.tsx">API Playground - 预设、速度与字号</code>

<code src="../demos/gradient-text.tsx">渐变文字基础用法</code>

## API

### GradientTextProps

| 属性           | 说明                                                 | 类型                  | 默认值                                                    | 版本 |
| -------------- | ---------------------------------------------------- | --------------------- | --------------------------------------------------------- | ---- |
| children       | 文本内容                                             | `React.ReactNode`     | -                                                         | -    |
| colors         | 渐变颜色数组（至少 2 个，建议首尾相同形成无缝循环）  | `string[]`            | `['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']` | -    |
| animationSpeed | 渐变动画一个循环周期（秒），数值越大越慢             | `number`              | `8`                                                       | -    |
| className      | 自定义类名                                           | `string`              | -                                                         | -    |
| style          | 自定义样式（建议在此设置 `fontSize` / `fontWeight`） | `React.CSSProperties` | -                                                         | -    |

## 注意事项

1. `colors` 至少传两个色值；为了形成无缝循环动画，推荐首尾使用相同颜色。
2. `animationSpeed` 单位是秒，数值越大动画越慢；想要近似静态可以传一个非常大的值。
3. 字体相关样式（`fontSize` / `fontWeight` / `fontFamily` 等）通过 `style` 或外层包裹传入，`GradientText` 不内置字号约束。
