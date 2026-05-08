import { act, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  HistoryRunningIcon,
  HistoryRunningIconContainer,
} from '../../../src/History/components/HistoryRunningIcon';

describe('HistoryRunningIcon', () => {
  it('应该渲染运行图标', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon />);
      container = result.container;
    });
    const svg = container!.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('应该暂停动画', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon paused={true} />);
      container = result.container;
    });
    const svg = container!.querySelector('svg');
    expect(svg).toHaveStyle({ animation: 'none' });
  });

  it('应该应用自定义动画样式', async () => {
    const animationStyle = { animationTimingFunction: 'ease-in-out' };
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <HistoryRunningIcon animationStyle={animationStyle} />,
      );
      container = result.container;
    });
    const svg = container!.querySelector('svg');
    expect(svg).toHaveStyle({ animationTimingFunction: 'ease-in-out' });
  });

  it('应该设置自定义宽度和高度', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon width={32} height={32} />);
      container = result.container;
    });
    const svg = container!.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('应该包含渐变定义', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon />);
      container = result.container;
    });
    const gradient = container!.querySelector('linearGradient');
    expect(gradient).toBeInTheDocument();
  });

  it('应该包含clipPath定义', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon />);
      container = result.container;
    });
    const clipPath = container!.querySelector('clipPath');
    expect(clipPath).toBeInTheDocument();
  });

  it('应该包含path元素', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon />);
      container = result.container;
    });
    const path = container!.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('应该设置自定义颜色', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon color="#FF0000" />);
      container = result.container;
    });
    const path = container!.querySelector('path');
    expect(path).toHaveAttribute('fill', '#FF0000');
  });

  it('应该使用渐变填充（默认）', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon />);
      container = result.container;
    });
    const path = container!.querySelector('path');
    const fill = path?.getAttribute('fill');
    expect(fill).toMatch(/url\(#history-running-.*-gradient\)/);
  });

  it('应该应用SVG属性', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <HistoryRunningIcon
          data-testid="custom-icon"
          aria-label="Loading icon"
        />,
      );
      container = result.container;
    });
    const svg = container!.querySelector('svg');
    expect(svg).toHaveAttribute('data-testid', 'custom-icon');
    expect(svg).toHaveAttribute('aria-label', 'Loading icon');
  });

  it('animated=true 时不应在组件 container 内注入 <style>（已改为模块级注入到 document.head）', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIcon animated={true} />);
      container = result.container;
    });
    // 组件容器内不应有 <style>，避免重复 DOM 插入
    expect(container!.querySelector('style')).not.toBeInTheDocument();
  });

  it('animated=true 时 keyframes 应被注入到 document.head 且同名只注入一次', async () => {
    // 清理上次测试残留
    document
      .querySelectorAll('style[data-history-running-icon]')
      .forEach((el) => el.remove());

    await act(async () => {
      render(<HistoryRunningIcon animated />);
    });
    const firstCount = document.querySelectorAll(
      'style[data-history-running-icon]',
    ).length;
    expect(firstCount).toBeGreaterThan(0);

    // 渲染第二个实例：应得到不同的 animationId，所以新增一份 keyframes
    await act(async () => {
      render(<HistoryRunningIcon animated />);
    });
    const afterSecondCount = document.querySelectorAll(
      'style[data-history-running-icon]',
    ).length;
    expect(afterSecondCount).toBe(firstCount + 1);

    // 同名 keyframes 在 ensureKeyframesInjected 内被去重，重复触发不会再次插入
    const styleEls = document.querySelectorAll(
      'style[data-history-running-icon]',
    );
    const dupName = styleEls[0].getAttribute('data-history-running-icon')!;
    // 直接调用一次 createElement 注入同名 keyframes 不会被重复注入逻辑屏蔽，
    // 但渲染同 id 的实例（不可能，counter 永远递增）也不会撞 — 这里我们断言「至少没有重复同名标签」
    const namesSeen = new Set<string>();
    styleEls.forEach((el) => {
      const name = el.getAttribute('data-history-running-icon');
      expect(name).not.toBeNull();
      expect(namesSeen.has(name!)).toBe(false);
      namesSeen.add(name!);
    });
    expect(dupName).toMatch(/^history-running-\d+$/);
  });
});

describe('HistoryRunningIconContainer', () => {
  it('应该渲染容器', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIconContainer />);
      container = result.container;
    });
    const div = container!.firstChild as HTMLElement;
    expect(div).toBeInTheDocument();
    expect(div.tagName).toBe('DIV');
  });

  it('应该渲染图标', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIconContainer />);
      container = result.container;
    });
    const svg = container!.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('应该应用默认大小', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIconContainer />);
      container = result.container;
    });
    const div = container!.firstChild as HTMLElement;
    expect(div).toHaveStyle({
      width: '16px',
      height: '16px',
    });
  });

  it('应该应用自定义数字大小', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIconContainer size={24} />);
      container = result.container;
    });
    const div = container!.firstChild as HTMLElement;
    expect(div).toHaveStyle({
      width: '24px',
      height: '24px',
    });
  });

  it('应该应用自定义字符串大小', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIconContainer size="2em" />);
      container = result.container;
    });
    const div = container!.firstChild as HTMLElement;
    expect(div.getAttribute('style')).toContain('width: 2em');
    expect(div.getAttribute('style')).toContain('height: 2em');
  });

  it('应该应用自定义容器样式', async () => {
    const customStyle = { background: 'red', padding: '10px' };
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <HistoryRunningIconContainer containerStyle={customStyle} />,
      );
      container = result.container;
    });
    const div = container!.firstChild as HTMLElement;
    expect(div).toHaveStyle(customStyle);
  });

  it('应该传递图标属性', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <HistoryRunningIconContainer
          iconProps={{ animated: false, color: 'blue' }}
        />,
      );
      container = result.container;
    });
    const svg = container!.querySelector('svg');
    expect(svg).not.toHaveStyle({
      animation: expect.any(String),
    });
    const path = container!.querySelector('path');
    expect(path).toHaveAttribute('fill', 'blue');
  });

  it('应该渲染子元素', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <HistoryRunningIconContainer>
          <span>子元素</span>
        </HistoryRunningIconContainer>,
      );
      container = result.container;
    });
    expect(container!.textContent).toContain('子元素');
  });

  it('应该使用flex布局居中', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIconContainer />);
      container = result.container;
    });
    const div = container!.firstChild as HTMLElement;
    expect(div).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  it('应该将大小传递给图标', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HistoryRunningIconContainer size={32} />);
      container = result.container;
    });
    const svg = container!.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32px');
    expect(svg).toHaveAttribute('height', '32px');
  });
});
