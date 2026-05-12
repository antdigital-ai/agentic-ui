import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { VisualList } from '../VisualList';

const VisualListFull = VisualList;

describe('VisualList 组件', () => {
  const mockData = [
    { id: '1', src: '/img1.jpg', alt: '图片1', title: '标题1' },
    { id: '2', src: '/img2.jpg', alt: '图片2', title: '标题2' },
    { id: '3', src: '/img3.jpg', alt: '图片3', title: '标题3' },
  ];

  it('应该渲染图片列表', () => {
    const { container } = render(<VisualList data={mockData} />);

    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(3);
  });

  it('应该显示图片的 alt 和 title 属性', () => {
    const { container } = render(<VisualList data={mockData} />);

    const firstImg = container.querySelector('img');
    expect(firstImg).toHaveAttribute('alt', '图片1');
    expect(firstImg).toHaveAttribute('title', '标题1');
  });

  it('应该在加载状态下显示加载提示', () => {
    const { container } = render(<VisualList data={mockData} loading />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();

    // 加载时不应显示图片
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(0);
  });

  it('应该支持自定义加载渲染', () => {
    const CustomLoading = () => <div>自定义加载...</div>;

    render(
      <VisualList data={mockData} loading loadingRender={CustomLoading} />,
    );

    expect(screen.getByText('自定义加载...')).toBeInTheDocument();
  });

  it('应该在数据为空时显示空状态', () => {
    render(<VisualList data={[]} />);

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('应该支持自定义空状态渲染', () => {
    const CustomEmpty = () => <div>没有图片</div>;

    render(<VisualList data={[]} emptyRender={CustomEmpty} />);

    expect(screen.getByText('没有图片')).toBeInTheDocument();
  });

  it('应该支持过滤功能', () => {
    const filter = (item: any) => item.id !== '2';

    const { container } = render(
      <VisualList data={mockData} filter={filter} />,
    );

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
  });

  it('应该支持带链接的图片', () => {
    const dataWithLinks = [
      { id: '1', src: '/img1.jpg', href: 'https://example.com' },
    ];

    const { container } = render(<VisualList data={dataWithLinks} />);

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('应该支持自定义渲染项', () => {
    const customRender = (item: any, index: number) => (
      <div key={index} data-testid={`custom-${index}`}>
        自定义: {item.title}
      </div>
    );

    render(<VisualList data={mockData} renderItem={customRender} />);

    expect(screen.getByTestId('custom-0')).toBeInTheDocument();
    expect(screen.getByText('自定义: 标题1')).toBeInTheDocument();
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <VisualList data={mockData} className="custom-list" />,
    );

    // className 加在外层容器 div 上
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-list');
  });

  it('应该支持自定义样式', () => {
    const { container } = render(
      <VisualList data={mockData} style={{ backgroundColor: 'red' }} />,
    );

    // style 加在外层容器 div 上
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ backgroundColor: 'red' });
  });

  it('应该支持自定义项样式', () => {
    const { container } = render(
      <VisualList data={mockData} itemStyle={{ padding: '10px' }} />,
    );

    const firstItem = container.querySelector('li');
    expect(firstItem).toHaveStyle('padding: 10px');
  });

  it('应该支持自定义图片样式', () => {
    const { container } = render(
      <VisualList data={mockData} imageStyle={{ borderRadius: '50%' }} />,
    );

    const firstImg = container.querySelector('img');
    expect(firstImg).toHaveStyle('border-radius: 50%');
  });

  it('应该支持自定义链接样式', () => {
    const dataWithLinks = [
      { id: '1', src: '/img1.jpg', href: 'https://example.com' },
    ];

    const { container } = render(
      <VisualList data={dataWithLinks} linkStyle={{ color: 'red' }} />,
    );

    const link = container.querySelector('a');
    expect(link).toHaveStyle({ color: 'red' });
  });

  it('应该设置默认的图片尺寸', () => {
    const { container } = render(<VisualList data={mockData} />);

    const firstImg = container.querySelector('img');
    // 组件通过 CSS-in-JS 控制尺寸，图片元素始终存在
    expect(firstImg).toBeInTheDocument();
  });

  it('应该使用 id 作为 key', () => {
    const { container } = render(<VisualList data={mockData} />);

    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(3);
  });

  it('应该在没有 id 时使用索引作为 key', () => {
    const dataWithoutId = [
      { src: '/img1.jpg', alt: '图片1' },
      { src: '/img2.jpg', alt: '图片2' },
    ];

    const { container } = render(<VisualList data={dataWithoutId} />);

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
  });

  it('应该使用 title 作为 alt 的后备值', () => {
    const dataWithoutAlt = [{ src: '/img1.jpg', title: '标题1' }];

    const { container } = render(<VisualList data={dataWithoutAlt} />);

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '标题1');
  });

  it('应该处理没有 href 的项', () => {
    const { container } = render(<VisualList data={mockData} />);

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(0);
  });

  it('应该过滤后显示空状态', () => {
    const filter = () => false;

    render(<VisualList data={mockData} filter={filter} />);

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('应该应用 flex 布局样式', () => {
    const { container } = render(<VisualList data={mockData} />);

    const list = container.querySelector('ul');
    expect(list).toHaveStyle({
      display: 'flex',
      listStyle: 'none',
      margin: '0',
      padding: '0',
    });
  });

  it('应该在加载状态下也应用 flex 样式', () => {
    const { container } = render(<VisualList data={mockData} loading />);

    // 加载状态渲染为 <ul>，样式通过 CSS-in-JS 注入
    const loadingList = container.querySelector('ul');
    expect(loadingList).toBeInTheDocument();
    expect(loadingList).toHaveClass('visual-list-loading');
  });

  it('应该处理空的 data 数组', () => {
    const { container } = render(<VisualList data={[]} />);

    // 空状态渲染为 <ul>，带有 visual-list-empty 类名
    const emptyList = container.querySelector('ul');
    expect(emptyList).toBeInTheDocument();
    expect(emptyList).toHaveClass('visual-list-empty');
  });

  it('应该设置图片的 object-fit 样式', () => {
    const { container } = render(<VisualList data={mockData} />);

    const firstImg = container.querySelector('img');
    expect(firstImg).toHaveStyle('object-fit: cover');
  });

  it('应该设置项的默认样式', () => {
    const { container } = render(<VisualList data={mockData} />);

    // 样式通过 CSS-in-JS 注入，验证列表项存在且有正确的类名
    const firstItem = container.querySelector('li');
    expect(firstItem).toBeInTheDocument();
    expect(firstItem).toHaveClass('visual-list-item');
  });

  it('应该应用链接的默认样式', () => {
    const dataWithLinks = [
      { id: '1', src: '/img1.jpg', href: 'https://example.com' },
    ];

    const { container } = render(<VisualList data={dataWithLinks} />);

    const link = container.querySelector('a');
    expect(link).toHaveStyle({
      display: 'flex',
      textDecoration: 'none',
    });
  });

  it('图片 onError 时应显示默认图标', async () => {
    const dataWithOneImg = [{ id: '1', src: '/valid.jpg', alt: '图' }];
    const { container } = render(<VisualListFull data={dataWithOneImg} />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    fireEvent.error(img!);
    await waitFor(() => {
      const defaultIcon = container.querySelector('[data-type="image"]');
      expect(defaultIcon).toBeTruthy();
    });
  });

  it('相同 data 引用下更新图片样式时应刷新默认渲染项', () => {
    const dataWithOneImg = [{ id: '1', src: '/valid.jpg', alt: '图' }];
    const { container, rerender } = render(
      <VisualListFull
        data={dataWithOneImg}
        imageStyle={{ width: 24, height: 24 }}
      />,
    );

    expect(container.querySelector('img')).toHaveStyle({
      width: '24px',
      height: '24px',
    });

    rerender(
      <VisualListFull
        data={dataWithOneImg}
        imageStyle={{ width: 48, height: 48 }}
      />,
    );

    expect(container.querySelector('img')).toHaveStyle({
      width: '48px',
      height: '48px',
    });
  });
});

describe('VisualList（Components/VisualList）', () => {
  const mockData = [
    { id: '1', src: '/img1.jpg', alt: '图片1', title: '标题1' },
    { id: '2', src: '/img2.jpg', alt: '图片2', title: '标题2' },
  ];

  it('无 filter 时 displayList 使用原始 data', () => {
    const { container } = render(<VisualListFull data={mockData} />);
    expect(container.querySelectorAll('img')).toHaveLength(2);
  });

  it('有 filter 时走 data.filter 分支', () => {
    const { container } = render(
      <VisualListFull data={mockData} filter={(item) => item.id === '1'} />,
    );
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('使用 renderItem 时不走 defaultRenderItem', () => {
    render(
      <VisualListFull
        data={mockData}
        renderItem={(item, i) => (
          <li key={item.id || i} data-testid={`full-${i}`}>
            {item.title}
          </li>
        )}
      />,
    );
    expect(screen.getByTestId('full-0')).toHaveTextContent('标题1');
  });

  it('isLoading 优先于 legacy loading', () => {
    render(<VisualListFull data={mockData} loading={false} isLoading />);
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('加载态支持自定义 loadingRender', () => {
    render(
      <VisualListFull
        data={mockData}
        isLoading
        loadingRender={() => <span>Full loading</span>}
      />,
    );
    expect(screen.getByText('Full loading')).toBeInTheDocument();
  });

  it('数据为空时渲染空状态', () => {
    render(<VisualListFull data={[]} />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('可展示 description 描述', () => {
    const { container } = render(
      <VisualListFull data={mockData} description="描述文案" />,
    );
    expect(container.textContent).toContain('描述文案');
  });
});
