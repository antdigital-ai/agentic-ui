import {
  parserMdToSchema,
  parserSlateNodeToMarkdown,
} from '@ant-design/agentic-ui/MarkdownEditor';
import { describe, expect, it } from 'vitest';
import { MarkdownFormatter } from '../index';

describe('MarkdownFormatter', () => {
  describe('normalizeParagraphs', () => {
    it('should convert multiple newlines to double newlines', () => {
      const input = 'First paragraph\n\n\n\nSecond paragraph';
      const expected = 'First paragraph\n\nSecond paragraph';
      expect(MarkdownFormatter.normalizeParagraphs(input)).toBe(expected);
    });

    it('should convert single newline to double newlines', () => {
      const input = 'First paragraph\nSecond paragraph';
      const expected = 'First paragraph\n\nSecond paragraph';
      expect(MarkdownFormatter.normalizeParagraphs(input)).toBe(expected);
    });

    it('should handle different line endings', () => {
      const input = 'First paragraph\r\nSecond paragraph\rThird paragraph';
      const expected = 'First paragraph\n\nSecond paragraph\n\nThird paragraph';
      expect(MarkdownFormatter.normalizeParagraphs(input)).toBe(expected);
    });

    it('should trim extra whitespace', () => {
      const input = '\n\nFirst paragraph\n\n\n  \n\nSecond paragraph\n\n';
      const expected = 'First paragraph\n\nSecond paragraph';
      expect(MarkdownFormatter.normalizeParagraphs(input)).toBe(expected);
    });
  });

  describe('addPanguSpacing', () => {
    it('should add spaces between Chinese and English', () => {
      const cases = [
        {
          input: '中文English混合',
          expected: '中文 English 混合',
        },
        {
          input: 'English中文English',
          expected: 'English 中文 English',
        },
      ];

      cases.forEach(({ input, expected }) => {
        expect(MarkdownFormatter.addPanguSpacing(input)).toBe(expected);
      });
    });

    it('should add spaces between Chinese and numbers', () => {
      const cases = [
        {
          input: '价格是123元',
          expected: '价格是 123 元',
        },
        {
          input: '1个2个3个',
          expected: '1 个 2 个 3 个',
        },
      ];

      cases.forEach(({ input, expected }) => {
        expect(MarkdownFormatter.addPanguSpacing(input)).toBe(expected);
      });
    });

    it('should preserve Markdown link syntax', () => {
      const cases = [
        {
          input: '[测试Link说明](https://example.com)',
          expected: '[测试Link说明](https://example.com)',
        },
        {
          input: '这是一个[测试Link说明](https://example.com)示例',
          expected: '这是一个 [测试Link说明](https://example.com) 示例',
        },
      ];

      cases.forEach(({ input, expected }) => {
        expect(MarkdownFormatter.addPanguSpacing(input)).toBe(expected);
      });
    });

    it('should preserve inline code', () => {
      const cases = [
        {
          input: '使用`const x=123`作为示例',
          expected: '使用 `const x=123` 作为示例',
        },
        {
          input: '代码`console.log(你好)`输出',
          expected: '代码 `console.log(你好)` 输出',
        },
      ];

      cases.forEach(({ input, expected }) => {
        expect(MarkdownFormatter.addPanguSpacing(input)).toBe(expected);
      });
    });

    describe('mixed format tests', () => {
      it('should handle list items with bold text and Chinese characters', () => {
        const cases = [
          {
            input: '- **90%+** 得的利润',
            expected: '- **90%+** 得的利润',
          },
          {
            input: '- **高收益** 投资策略',
            expected: '- **高收益** 投资策略',
          },
          {
            input: '- 获得 **95%** 的满意度',
            expected: '- 获得 **95%** 的满意度',
          },
          {
            input: '- **重要提醒**：请及时Complete任务',
            expected: '- **重要提醒**：请及时 Complete 任务',
          },
        ];

        cases.forEach(({ input, expected }) => {
          expect(MarkdownFormatter.addPanguSpacing(input)).toBe(expected);
        });
      });

      it('should handle ordered list items with bold and percentage format', () => {
        const cases = [
          {
            input: '1. **90%+** 得的利润率',
            expected: '1. **90%+** 得的利润率',
          },
          {
            input: '2. 实现 **85%** completion率',
            expected: '2. 实现 **85%** completion 率',
          },
          {
            input: '3. **Success rate**达到99%',
            expected: '3. **Success rate**达到 99%',
          },
        ];

        cases.forEach(({ input, expected }) => {
          expect(MarkdownFormatter.addPanguSpacing(input)).toBe(expected);
        });
      });

      it('should handle nested lists with mixed formatting', () => {
        const input = `- **投资收益**：
  - **90%+** 得的利润
  - **85%** success rate
  - 风险控制Strategy效果显著`;

        const expected = `- **投资收益**： - **90%+** 得的利润 - **85%** success rate - 风险控制 Strategy 效果显著`;

        expect(MarkdownFormatter.addPanguSpacing(input)).toBe(expected);
      });

      it('should preserve bold formatting in complex list structures', () => {
        const input = `# 只读模式测试
- **90%+** 得的利润
- 使用**advanced**技术
- 实现100%accuracy`;

        const expected = `# 只读模式测试

- **90%+** 得的利润

- 使用**advanced**技术

- 实现 100%accuracy`;

        expect(MarkdownFormatter.format(input)).toBe(expected);
      });

      it('should handle percentage symbols with bold text correctly', () => {
        const cases = [
          {
            input: '**90%+** 利润增长',
            expected: '**90%+** 利润增长',
          },
          {
            input: '**95%-100%** 的完成率',
            expected: '**95%-100%** 的完成率',
          },
          {
            input: '达到**80%+**efficiency',
            expected: '达到**80%+**efficiency',
          },
          {
            input: 'Performance**90%+**提升',
            expected: 'Performance**90%+**提升',
          },
        ];

        cases.forEach(({ input, expected }) => {
          expect(MarkdownFormatter.addPanguSpacing(input)).toBe(expected);
        });
      });
    });

    describe('format', () => {
      it('should apply all formatting rules correctly', () => {
        const input = `Title heading
中文English混合
使用\`const x=123\`作为示例
[测试Link说明](https://example.com)`;
        const expected = `Title heading

中文 English 混合

使用 \`const x=123\` 作为示例

[测试Link说明](https://example.com)`;
        expect(MarkdownFormatter.format(input)).toBe(expected);
      });

      it('should handle complex mixed content', () => {
        const input = `# 标题Title123
代码示例code：
\`const x=123\`
价格是100元
[链接Link说明](url)`;
        const expected = `# 标题 Title123

代码示例 code：

\`const x=123\`

价格是 100 元

[链接Link说明](url)`;
        expect(MarkdownFormatter.format(input)).toBe(expected);
      });

      it('should use set table content', () => {
        const input = `| 111 | 111 | 1111 |\n| :--- | :--- | :--- |\n| 111 | 111 | 111 |\n| 111 | 111 | 111 |`;
        const expected = `| 111 | 111 | 1111 |\n| :--- | :--- | :--- |\n| 111 | 111 | 111 |\n| 111 | 111 | 111 |`;
        expect(MarkdownFormatter.format(input)).toBe(expected);
      });

      it('should preserve JSON code blocks', () => {
        const input = `这是一个测试 JSON 的例子：

\`\`\`json
{
  "name": "test",
  "description": "这是一个测试",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "~4.9.0"
  }
}
\`\`\`

这是代码块后的内容。`;

        const expected = `这是一个测试 JSON 的例子：

\`\`\`json
{
  "name": "test",
  "description": "这是一个测试",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "~4.9.0"
  }
}
\`\`\`

这是代码块后的内容。`;

        expect(MarkdownFormatter.format(input)).toBe(expected);
      });

      it('should handle multiple JSON code blocks', () => {
        const input = `第一个 JSON 块：

\`\`\`json
{
  "key": "value"
}
\`\`\`

第二个 JSON 块：

\`\`\`json
{
  "array": [1, 2, 3],
  "nested": {
    "field": "test"
  }
}
\`\`\`

这是最后的内容。`;

        const expected = `第一个 JSON 块：

\`\`\`json
{
  "key": "value"
}
\`\`\`

第二个 JSON 块：

\`\`\`json
{
  "array": [1, 2, 3],
  "nested": {
    "field": "test"
  }
}
\`\`\`

这是最后的内容。`;

        expect(MarkdownFormatter.format(input)).toBe(expected);
      });
    });

    it('should format company analysis correctly', () => {
      const input = `<TASK_RESULT>


## 1. ON Semiconductor公司分析

### 1.1 公司基本信息，生意模式，创始人背景和公司发展

**公司概况**：
- 公司全称：ON Semiconductor Corporation (以onsemi为商标名称)
- 成立时间：1999年，最初是Motorola半导体产品部门的分拆
- 总部位置：美国亚利桑那州斯科茨代尔
- 首席执行官：Hassane El-Khoury (2020年底上任，之前是Cypress Semiconductor的CEO)

**业务模式**：
onsemi是一家专注于智能电源和传感技术的半导体供应商，为汽车、工业、云计算、医疗和物联网市场提供解决方案。公司业务分为三个主要部门：
1. 电源解决方案集团 (PSG) - 54%收入
2. 高级解决方案集团 (ASG) - 30%收入
3. 智能传感集团 (ISG) - 16%收入

**发展历程**：
- 1999年：从Motorola分拆成立
- 2000年：完成首次公开募股(IPO)
- 2011年：收购SANYO半导体
- 2016年：收购Fairchild半导体
- 2020年：Hassane El-Khoury接任CEO，开始战略转型
- 2021年：品牌重塑为"onsemi"，收购GT Advanced Technologies加强SiC业务
- 2023-2024年：继续拓展SiC业务，聚焦汽车和工业市场

**战略转型**：
自Hassane El-Khoury上任以来，公司进行了重大战略调整：
- 聚焦高增长、高价值市场，特别是汽车电气化、ADAS、能源基础设施和工厂自动化
- 剥离非核心业务，专注于盈利增长和可持续财务表现
- 加大对硅碳化物(SiC)技术的投资
- 优化制造设施，实施Fabrite战略
- 与战略客户签订长期供应协议(LTSAs)

### 1.2 过去5年的财务表现

_(Fiscal Years End on 12/31 on Calendar Year)_

---

#### **Balance Sheet (bn USD)**

| Item | 2020 | 2021 | 2022 | 2023 | 2024 |
|------|------|------|------|------|------|
| **Total Assets** | 9.63 | 11.98 | 13.22 | 13.92 | 14.09 |
| **Total Liabilities** | 5.02 | 5.77 | 5.41 | 5.32 | 5.28 |
| **Shareholder Equity** | 4.60 | 6.21 | 7.80 | 8.60 | 8.81 |
| Cash & Cash Equivalents | 1.35 | 2.92 | 2.48 | 2.47 | 2.69 |
| Trade & Other Receivables | 0.81 | 0.84 | 0.94 | 1.07 | 1.16 |
| Inventories | 1.38 | 1.62 | 2.11 | 2.24 | 2.24 |
| PPE | 2.52 | 3.45 | 4.40 | 4.38 | 4.36 |
| Intangible Assets | 0.50 | 0.36 | 0.30 | 0.27 | 0.26 |

---

#### **Income Statement (bn USD)**

| Item | 2020 | 2021 | 2022 | 2023 | 2024 |
|------|------|------|------|------|------|
| Revenue | 5.26 | 6.74 | 8.33 | 8.25 | 7.08 |
| Growth | -4.8% | 28.3% | 23.5% | -0.9% | -14.2% |
| Gross Profit | 1.72 | 2.71 | 4.08 | 3.88 | 3.22 |
| Gross Margin | 32.7% | 40.3% | 49.0% | 47.1% | 45.4% |
| OpEx | 1.37 | 1.35 | 1.31 | 1.27 | 1.31 |
| R&D | 0.64 | 0.66 | 0.60 | 0.58 | 0.61 |
| SG&A | 0.60 | 0.60 | 0.63 | 0.64 | 0.65 |
| Operating Income | 0.35 | 1.36 | 2.76 | 2.61 | 1.90 |
| Operating Margin | 6.6% | 20.2% | 33.2% | 31.7% | 26.9% |
| Net Income | 0.24 | 1.01 | 1.90 | 2.18 | 1.57 |
| Net Margin | 4.5% | 15.0% | 22.8% | 26.5% | 22.2% |
| EPS (USD) | 0.58 | 2.27 | 4.24 | 4.89 | 3.63 |
| Growth | - | 291.4% | 86.8% | 15.3% | -25.8% |

---

#### **Profitability Metrics**

| Metric | 2020 | 2021 | 2022 | 2023 | 2024 |
|--------|------|------|------|------|------|
| Gross Margin | 32.7% | 40.3% | 49.0% | 47.1% | 45.4% |
| Operating Margin | 6.6% | 20.2% | 33.2% | 31.7% | 26.9% |
| Net Profit Margin | 4.5% | 15.0% | 22.8% | 26.5% | 22.2% |
| ROE | 5.1% | 16.3% | 24.4% | 25.4% | 17.8% |
| ROA | 2.5% | 8.4% | 14.4% | 15.7% | 11.2% |

---

#### **Cash Flow Statement (bn USD)**

| Item | 2020 | 2021 | 2022 | 2023 | 2024 |
|------|------|------|------|------|------|
| **Operating Cash Flow** | - | 1.52 | - | 1.98 | 1.91 |
| **Capital Expenditure** | - | 0.45 | - | 1.54 | 0.69 |
| **Free Cash Flow** | - | 1.07 | - | 0.44 | 1.21 |
| FCF Margin | - | 15.9% | - | 5.3% | 17.1% |

### 1.3 最近重大事件与新闻

1. **收购与扩张**：
   - 2025年1月完成对Qorvo的碳化硅JFET技术组合的收购，交易金额为1.15亿美元
   - 2025年3月提议以每股35.10美元收购Allegro MicroSystems，总企业价值69亿美元，但于2025年4月撤回提案
   - 2023年完成对GlobalFoundries位于纽约East Fishkill的300mm晶圆制造厂的收购

2. **产品创新**：
   - 2025年3月发布Hyperlux™ ID系列先进深度传感器，用于工业自动化和机器人应用
   - 扩大碳化硅(SiC)产能，在新罕布什尔州Hudson、捷克共和国和韩国增加投资

3. **战略合作**：
   - 2024年12月与DENSO加强合作关系，支持自动驾驶和高级驾驶辅助系统技术
   - 与大众集团、特斯拉、捷豹路虎和现代汽车集团等汽车制造商建立合作关系

4. **可持续发展**：
   - 2025年2月获得科学碳目标倡议(SBTi)对其减排目标的验证
   - 承诺到2034年将绝对范围1和2的温室气体排放量减少58.8%
   - 计划到2040年实现净零排放

### 1.4 好生意：定量指标、定性指标 (波特五力)

**定量指标评估**：

1. **收入增长**：
   - 2021年增长28.3%，2022年增长23.5%，显示出强劲增长
   - 2023年和2024年有所下滑(-0.9%和-14.2%)，反映出半导体行业的周期性

2. **盈利能力**：
   - 毛利率从2020年的32.7%提升至2022年的49.0%，尽管之后有所下降，但仍保持在较高水平(2024年为45.4%)
   - 营业利润率从2020年的6.6%大幅提升至2022年的33.2%，显示出运营效率的显著改善

3. **自由现金流**：
   - 2024年自由现金流达到12.1亿美元，较2023年的4.4亿美元大幅增长
   - 自由现金流利润率为17.1%，表明公司有强大的现金生成能力

**定性指标评估（波特五力分析）**：

1. **现有竞争者的竞争程度** (中高)：
   - 电源管理和传感器市场竞争激烈，主要竞争对手包括英飞凌(Infineon)、意法半导体(STMicroelectronics)、德州仪器(Texas Instruments)、Wolfspeed等
   - 在某些细分市场，如SiC功率器件领域，onsemi具有一定的差异化优势
   - 评分：3/5

2. **新进入者的威胁** (低):
   - 半导体行业具有高技术壁垒和资本要求
   - 制造工艺和设计经验需要长期积累
   - 公司通过垂直整合(如SiC业务从基板到模块)建立了更高的进入壁垒
   - 评分：4.5/5

3. **替代品的威胁** (低到中):
   - SiC技术目前在电动汽车和高压应用中优于传统硅基解决方案
   - 未来可能面临如氮化镓(GaN)等新兴技术的替代风险，但短期内威胁有限
   - 评分：4/5

4. **供应商的议价能力** (中):
   - 原材料和晶圆代工的供应有时受限，可能增加成本
   - 公司通过收购GTAT增强了SiC材料的自给能力，减少了对外部供应商的依赖
   - 评分：3.5/5

5. **购买者的议价能力** (中高):
   - 汽车制造商和大型工业客户具有较强的议价能力
   - 公司通过与客户签订长期供应协议(LTSAs)来稳定关系
   - 产品差异化和专注于高价值市场有助于提高议价能力
   - 评分：3/5

**总体评估**：
- onsemi在电源管理和传感技术领域有强大的市场地位
- 公司战略性聚焦于高增长市场（汽车电气化、工业自动化）
- 在SiC技术领域有垂直整合优势
- 毛利率和盈利能力优秀，但面临行业周期性挑战
- 波特五力综合评分：3.6/5，表明业务质量良好

### 1.5 好管理

**管理层评估**：

1. **战略愿景与执行力**：
   - CEO Hassane El-Khoury自2020年底上任以来推动了明确的战略转型
   - 成功实施了聚焦高价值市场和剥离非核心业务的战略
   - 通过收购GTAT增强了SiC业务的垂直整合能力
   - 评分：4.5/5

2. **资本配置**：
   - 2024年回购约9.1百万股普通股，总金额约6.5亿美元，表明对股东回报的重视
   - 在SiC领域进行战略性投资，包括捷克共和国的垂直整合制造设施
   - 具有纪律性的收购策略，例如在未达成合理条件时撤回对Allegro MicroSystems的收购提议
   - 评分：4/5

3. **企业文化与ESG承诺**：
   - 积极推进可持续发展目标，获得SBTi对减排目标的验证
   - 承诺到2040年实现净零排放
   - 加入联合国全球契约(UN Global Compact)，展示对企业社会责任的承诺
   - 连续多年被Ethisphere Institute评为"世界最道德公司"
   - 评分：4/5

4. **透明度与沟通**：
   - 定期举行投资者会议，清晰传达公司战略和业绩
   - 提供详细的财务和非财务指标
   - 评分：4/5

**总体管理评分**：4.1/5，表明管理质量优秀。

### 1.6 好价格

**估值指标**：

1. **市盈率(P/E)**：
   - 当前P/E：37.32倍
   - 相对于历史均值和行业平均水平，这一估值相对较高
   - 评分：2.5/5

2. **增长调整市盈率(PEG)**：
   - 公司在2021-2022年经历了高速增长，但近期增长有所放缓
   - 考虑到未来几年的增长预期，当前估值较为合理
   - 评分：3/5

3. **企业价值倍数**：
   - EV/EBITDA：约11倍
   - 对于一家质量较好的半导体公司，这一倍数相对合理
   - 评分：3.5/5

4. **自由现金流收益率**：
   - 基于2024年自由现金流，收益率约为5.3%
   - 略高于美国10年期国债收益率
   - 评分：3.5/5

5. **价格相对历史区间**：
   - 当前价格54.21美元，处于52周价格区间(31.04-80.08美元)的中间位置
   - 较52周高点折价约32%
   - 评分：3.5/5

**估值总结**：
- 总体估值略偏高，但考虑到公司的质量和长期增长前景，仍在可接受范围内
- 当前价格可能已经反映了短期半导体行业周期性下滑的影响
- 长期投资者可能会发现当前价格具有一定吸引力，特别是考虑到公司在SiC和汽车电气化等领域的长期增长潜力

**总体价格评分**：3.2/5，表明价格适中。

### 1.7 批判性思考与反驳

**对"好生意"的质疑**：
1. 半导体行业的周期性是否会持续影响公司业绩？2023-2024年的收入下滑是暂时现象还是长期趋势？
2. SiC技术的竞争正在加剧，英飞凌、意法半导体和Wolfspeed等公司也在加大投资，onsemi能否保持竞争优势？
3. 对汽车行业的依赖是否会成为风险，特别是在电动车市场增长放缓的情况下？

**对"好管理"的质疑**：
1. 过去的大型收购（如SANYO和Fairchild）的整合效果如何？这是否表明管理层可能在未来的并购中面临挑战？
2. 尽管股票回购活跃，但公司没有支付股息，这是否反映了资本回报策略的不足？

**对"好价格"的质疑**：
1. 37倍的市盈率在半导体行业中属于高估，特别是考虑到近期增长放缓
2. 如果行业下滑持续时间长于预期，当前估值可能难以支撑

**反思与回应**：
- 半导体行业的周期性确实存在，但onsemi通过转向高价值市场和签订长期供应协议来减轻这种影响
- SiC竞争加剧是事实，但onsemi的垂直整合策略和在中国市场的强势地位提供了差异化优势
- 尽管汽车市场占比高，但公司也在工业和AI数据中心等其他领域扩大业务
- 管理层已展示出在El-Khoury领导下的执行力，战略转型成效明显
- 当前估值虽然不低，但考虑到公司质量和长期增长潜力，仍有合理性

**调整后评分**：
- 好生意：从3.6/5调整为3.4/5
- 好管理：维持4.1/5
- 好价格：从3.2/5调整为3.0/5

### 1.8 综合评估

**综合分数**：(3.4*0.4 + 4.1*0.3 + 3.0*0.3) = 3.48/5

**ON Semiconductor的投资价值评估**：

ON Semiconductor (onsemi) 是一家质量较好的半导体公司，在电源管理和智能传感技术领域具有竞争优势。公司成功实施了从广泛的半导体产品向高价值、高毛利率业务的战略转型，特别是聚焦于汽车电气化和工业自动化等高增长领域。

**优势**：
- 在汽车和工业市场的强劲地位，占总收入约80%
- 硅碳化物(SiC)业务的垂直整合，从基板到模块的全产业链能力
- 高毛利率(45%+)和强劲的自由现金流生成能力
- 管理层执行力强，战略清晰，资本配置纪律性好
- 与主要客户的长期供应协议提供业务稳定性

**风险**：
- 半导体行业的周期性，2023-2024年收入已经出现下滑
- SiC市场竞争加剧，面临英飞凌、意法半导体等强劲对手
- 对汽车市场的高度依赖(54%)可能带来波动
- 相对较高的估值(P/E 37.32)需要持续的高增长来支撑
- 全球贸易环境和供应链风险

**前景展望**：
中长期来看，onsemi在汽车电气化、工业自动化和AI数据中心等领域的布局与全球大趋势相符。SiC技术在电动汽车和可再生能源等应用中的需求预计将持续增长。公司的垂直整合战略和与关键客户的深度合作为长期增长奠定了基础。

**关注要点**：
- 监测SiC业务的增长和盈利情况
- 关注汽车市场特别是电动车市场的发展趋势
- 留意半导体行业周期的变化信号
- 评估管理层执行长期战略的持续成效

**综合结论**：
ON Semiconductor是一家具有良好质量的半导体公司，战略方向清晰，管理执行力强。尽管当前估值不低，但考虑到其在高增长市场的布局和技术优势，中长期投资价值值得关注。投资者应关注行业周期性风险，并以合理价格建立仓位。

</TASK_RESULT>`;
      expect(MarkdownFormatter.format(input)).toMatchSnapshot();

      expect(
        MarkdownFormatter.format(
          parserSlateNodeToMarkdown(parserMdToSchema(input).schema),
        ),
      ).toMatchSnapshot();
    });
  });
});
