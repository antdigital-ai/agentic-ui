import '@testing-library/jest-dom';
import { ConfigProvider } from 'antd';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { BaseMarkdownEditor } from '../src/MarkdownEditor/BaseMarkdownEditor';
import { TestWrapper } from './testUtils';

// 复杂的 Markdown 内容 - 拼多多商业模式分析
const complexMarkdownContent = `### 核心商业模式

**团购电商平台**

拼多多于2015年创立，核心是开创性的"团购模式"，以"更省钱、更有趣"为价值主张。平台将"人"放在中心，而非传统电商的"商品"中心模式，通过理解每次点击背后的人性需求，构建以消费者为中心的商业模式[^1]。

**使命与价值观**

- **使命**：服务最广泛的消费群体，提供优质低价的商品和服务[^2]

- **三大特色**：普惠、人本、更开放[^3]

- **长期愿景**："Costco + Disney"模式[^4]

### 收入结构（2025年Q3）

| 业务板块 | 收入规模 | 同比增长 | 收入占比 |
|---------|----------|----------|----------|
| 线上营销服务 | 533亿元 | 8% | 49.2% |
| 交易服务 | 549亿元 | 10% | 50.8% |
| **总收入** | **1083亿元** | **9%** | **100%** |

**收入来源分析**

1. **线上营销服务**：商家在平台投放广告的费用

2. **交易服务**：基于交易额的佣金和手续费收入

### 核心业务板块

**1. 农产品电商（核心优势）**

- 定位：中国最大的农产品上行平台[^5]

- 成果：2025年上半年农产品销量同比增长47%[^6]

- 商家增长：00后农货商家数量同比增长超30%[^7]

**2. 产业带改造**

- 覆盖：平湖羽绒、惠州零食、佛山童装、山东箱包等数十个产业带[^8]

- 模式：通过数字化能力推动供应链各环节创新升级

- 目标：解决同质化竞争，推动产业高质量发展

**3. 全球化业务（Temu）**

- 发展：已运营三年多，服务多个海外市场

- 挑战：面临贸易政策、税务、数据安全等监管环境变化[^9]

### 平台生态战略

**千亿扶持计划**

- **100亿减免计划**：减少商家经营费用

- **千亿扶持战略**：全方位支持商家发展[^10]

- **投资理念**：平台愿意牺牲部分利润为生态创造发展空间[^11]

**生态建设成果**

- 95后商家数量同比增长31%

- 00后商家数量同比增长44%

- 优质SKU数量同比增长超50%[^12]

### 竞争优势

**1. 差异化定位**

- 专注服务"最广泛的消费群体"

- 强调"质价比"而非单纯低价

**2. 供应链优势**

- 深度农产品供应链整合

- 产业带数字化改造能力

**3. 技术创新**

- 研发投入创新高：Q3达37亿元，同比增长41%[^13]

- 专注供应链创新和消费者体验

### 财务特征

**盈利能力**

- 非GAAP经营利润率：25%（同比下降2个百分点）[^14]

- 净利润：293亿元，同比增长17%

**现金流**

- 经营活动现金流：457亿元

- 现金储备：4238亿元[^15]

### 发展挑战与机遇

**挑战**

1. 电商行业竞争加剧，新业态层出不穷

2. 全球化业务面临监管不确定性

3. 生态投资影响短期盈利能力

**应对策略**

- 坚持长期主义，优先生态健康发展

- 持续加大研发和供应链投资

- 承担更大社会责任，推动产业升级

[^1]: [我们把人放在中心，而非传统电商的商品中心模式](https://know2.co/file/2112)

[^2]: [我们的使命是服务最广泛的消费群体，提供优质低价的商品和服务](https://know2.co/file/2112)

[^3]: [创造了以"普惠、人本、更开放"为特色的新电商](https://know2.co/file/2112)

[^4]: [我们坚定走向"Costco + Disney"愿景](https://know2.co/file/2112)

[^5]: [成为中国最大的农产品上行平台](https://know2.co/file/2112)

[^6]: [2025年上半年农产品销量同比增长47%](https://know2.co/file/2112)

[^7]: [00后农货商家数量同比增长超30%](https://know2.co/file/2112)

[^8]: [深入平湖羽绒、惠州零食、佛山童装等数十个产业带](https://know2.co/file/2112)

[^9]: [面临贸易政策、税务、数据安全等监管环境变化](https://know2.co/file/2112)

[^10]: [推出电商行业首个千亿级别的商家扶持行动](https://know2.co/file/2112)

[^11]: [平台愿意牺牲自己的利润来为平台生态创造更广阔的发展空间](https://know2.co/file/2112)

[^12]: [95后商家数量同比增长31%，00后商家数量同比增长44%，优质SKU数量同比增长超五成](https://know2.co/file/2112)

[^13]: [研发费用达37亿元，同比增长41%](https://know2.co/file/2112)

[^14]: [非GAAP经营利润率为25%，较去年同期下降2个百分点](https://know2.co/file/2112)

[^15]: [现金、现金等价物及短期投资总额为4238亿元](https://know2.co/file/2112)`;

describe('BaseMarkdownEditor - Snapshot 测试', () => {
  beforeAll(() => {
    // 禁用动画以减少测试时间
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = (element) => {
      const style = originalGetComputedStyle(element);
      return {
        ...style,
        animation: 'none',
        transition: 'none',
        transform: 'none',
      } as any;
    };
    console.log = vi.fn();
    console.warn = vi.fn();
  });

  describe('复杂 Markdown 内容渲染 (SSR)', () => {
    it('应该正确渲染包含表格、列表、引用、脚注的复杂 Markdown', () => {
      const html = renderToString(
        <ConfigProvider
          theme={{
            hashed: false,
          }}
        >
          <TestWrapper>
            <BaseMarkdownEditor
              initValue={complexMarkdownContent}
              readonly={true}
              className="knowledge-render"
              toc={false}
              style={{
                padding: 0,
                height: 'auto',
                minHeight: 14,
              }}
              contentStyle={{
                padding: 0,
                minHeight: 0,
              }}
            />
          </TestWrapper>
        </ConfigProvider>,
      );

      // 验证基本渲染结构（SSR 环境下内容可能还未完全初始化）
      expect(html).toContain('markdown-editor');
      expect(html).toContain('knowledge-render');
      expect(html).toContain('readonly');
      expect(html.length).toBeGreaterThan(0);

      // 使用 snapshot 测试
      expect(html).toMatchSnapshot();
    });

    it('应该在只读模式下正确渲染复杂内容', () => {
      const html = renderToString(
        <ConfigProvider
          theme={{
            hashed: false,
          }}
        >
          <TestWrapper>
            <BaseMarkdownEditor
              initValue={complexMarkdownContent}
              readonly={true}
              reportMode={false}
            />
          </TestWrapper>
        </ConfigProvider>,
      );

      // 验证基本渲染和只读模式
      expect(html).toContain('markdown-editor');
      expect(html).toContain('readonly');
      expect(html.length).toBeGreaterThan(0);

      expect(html).toMatchSnapshot();
    });

    it('应该正确渲染包含自定义样式的复杂内容', () => {
      const html = renderToString(
        <ConfigProvider
          theme={{
            hashed: false,
          }}
        >
          <TestWrapper>
            <BaseMarkdownEditor
              initValue={complexMarkdownContent}
              readonly={true}
              className="knowledge-render"
              style={{
                padding: 0,
                height: 'auto',
                minHeight: 14,
              }}
              contentStyle={{
                padding: 0,
                minHeight: 0,
              }}
              lazy={{
                enable: false,
              }}
            />
          </TestWrapper>
        </ConfigProvider>,
      );

      // 验证基本渲染和自定义样式
      expect(html).toContain('markdown-editor');
      expect(html).toContain('knowledge-render');
      expect(html.length).toBeGreaterThan(0);

      expect(html).toMatchSnapshot();
    });

    it('应该正确渲染基础结构（SSR 环境）', () => {
      const html = renderToString(
        <ConfigProvider
          theme={{
            hashed: false,
          }}
        >
          <TestWrapper>
            <BaseMarkdownEditor
              initValue={complexMarkdownContent}
              readonly={true}
            />
          </TestWrapper>
        </ConfigProvider>,
      );

      // 验证基本渲染结构
      expect(html).toContain('markdown-editor');
      expect(html).toContain('ant-agentic-agentic-md-editor');
      expect(html.length).toBeGreaterThan(0);

      expect(html).toMatchSnapshot();
    });
  });
});
