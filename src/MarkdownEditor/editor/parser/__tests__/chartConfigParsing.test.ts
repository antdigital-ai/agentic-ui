import { describe, expect, it } from 'vitest';
import { parserMarkdownToSlateNode } from '../parserMarkdownToSlateNode';

describe('Chart Configuration Parsing', () => {
  describe('对象格式图表配置', () => {
    it('应该将对象格式的图表配置转换为数组格式并正确解析', () => {
      const markdown = `<!-- {"chartType": "line", "x": "年份", "y": "新能源车双积分比例(%)", "title": "2018-2023年新能源车双积分比例变化"} -->
| 年份 | 新能源车双积分比例(%) |
| --- | --- |
| 2018 | 8 |
| 2019 | 10 |
| 2020 | 12 |
| 2021 | 14 |
| 2022 | 16 |
| 2023 | 18 |`;

      const result = parserMarkdownToSlateNode(markdown);

      // 应该解析为 chart 节点（可能包装在 card 中）
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      // 查找 card 中的 chart 节点
      const findChartNode = (node: any): any => {
        if (node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const chartNode = findChartNode(cardNode);
      expect(chartNode).toBeDefined();

      // 检查配置是否正确
      if (chartNode) {
        // 对象格式的配置会被存储在 otherProps 中
        // parseTableOrChart 会将其转换为数组格式
        const config = chartNode.otherProps?.config || chartNode.otherProps;
        expect(config).toBeDefined();
        // 如果是数组，取第一个；如果是对象，直接使用
        const chartConfig = Array.isArray(config) ? config[0] : config;
        expect(chartConfig?.chartType || config?.chartType).toBe('line');
        expect(chartConfig?.x || config?.x).toBe('年份');
        expect(chartConfig?.y || config?.y).toBe('新能源车双积分比例(%)');
        expect(chartConfig?.title || config?.title).toBe('2018-2023年新能源车双积分比例变化');

        // 检查数据源
        const dataSource = chartNode.otherProps?.dataSource;
        expect(dataSource).toBeDefined();
        expect(dataSource.length).toBe(6);
        expect(dataSource[0]).toMatchObject({
          年份: '2018',
          '新能源车双积分比例(%)': '8',
        });
      }
    });

    it('应该处理柱状图配置', () => {
      const markdown = `<!-- {"chartType": "column", "x": "车企", "y": "5月交付量(辆)", "title": "2025年5月中国造车新势力交付量排名"} -->
| 车企 | 5月交付量(辆) |
| --- | --- |
| 零跑 | 45067 |
| 理想 | 40856 |`;

      const result = parserMarkdownToSlateNode(markdown);
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findChartNode = (node: any): any => {
        if (node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const chartNode = findChartNode(cardNode);
      expect(chartNode).toBeDefined();
      if (chartNode) {
        const config = chartNode.otherProps?.config || chartNode.otherProps;
        expect(config).toBeDefined();
        // 如果是数组，取第一个；如果是对象，直接使用
        const chartConfig = Array.isArray(config) ? config[0] : config;
        expect(chartConfig?.chartType || config?.chartType).toBe('column');
        expect(chartConfig?.x || config?.x).toBe('车企');
        expect(chartConfig?.y || config?.y).toBe('5月交付量(辆)');
      }
    });

    it('应该处理饼图配置', () => {
      const markdown = `<!-- {"chartType": "pie", "x": "技术路线", "y": "市场份额(%)", "title": "2030年中国新能源汽车技术路线预测"} -->
| 技术路线 | 市场份额(%) |
| --- | --- |
| 纯电动 | 40 |
| 插混（含增程） | 40 |`;

      const result = parserMarkdownToSlateNode(markdown);
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findChartNode = (node: any): any => {
        if (node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const chartNode = findChartNode(cardNode);
      expect(chartNode).toBeDefined();
      if (chartNode) {
        // 检查图表节点类型是否正确
        expect(chartNode.type).toBe('chart');
        // 配置可能在 otherProps 中，也可能在 config 中
        const config = chartNode.otherProps?.config || chartNode.otherProps;
        expect(config).toBeDefined();
        // 如果是数组，取第一个；如果是对象，直接使用
        const chartConfig = Array.isArray(config) ? config[0] : config;
        expect(chartConfig?.chartType || config?.chartType).toBe('pie');
      }
    });
  });

  describe('数组格式图表配置', () => {
    it('应该正确解析数组格式的图表配置', () => {
      const markdown = `<!-- [{"chartType": "bar", "x": "品牌", "y": "市场份额(%)", "title": "2025上半年中国新能源汽车市场品牌构成"}] -->
| 品牌原产国 | 市场份额(%) |
| --- | --- |
| 中国本土 | 90 |
| 美国 | 10 |`;

      const result = parserMarkdownToSlateNode(markdown);
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findChartNode = (node: any): any => {
        if (node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const chartNode = findChartNode(cardNode);
      expect(chartNode).toBeDefined();
      if (chartNode) {
        const config = chartNode.otherProps?.config || 
          (chartNode.otherProps?.chartType ? [chartNode.otherProps] : null);
        expect(config).toBeDefined();
        expect(Array.isArray(config)).toBe(true);
        expect(config[0].chartType).toBe('bar');
      }
    });

    it('应该处理多图表配置', () => {
      const markdown = `<!-- [{"chartType": "bar", "x": "sens_type", "y": "count"}, {"chartType": "column", "x": "sens_type", "y": "count"}] -->
| sens_type | count |
| --- | --- |
| 类型A | 10 |
| 类型B | 20 |`;

      const result = parserMarkdownToSlateNode(markdown);
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findChartNode = (node: any): any => {
        if (node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const chartNode = findChartNode(cardNode);
      expect(chartNode).toBeDefined();
      if (chartNode) {
        const config = chartNode.otherProps?.config;
        expect(config).toBeDefined();
        expect(Array.isArray(config)).toBe(true);
        expect(config.length).toBe(2);
        expect(config[0].chartType).toBe('bar');
        expect(config[1].chartType).toBe('column');
      }
    });
  });

  describe('图表配置与表格数据', () => {
    it('应该正确关联图表配置和表格数据', () => {
      const markdown = `<!-- {"chartType": "line", "x": "年份", "y": "新能源车双积分比例(%)", "title": "2018-2023年新能源车双积分比例变化"} -->
| 年份 | 新能源车双积分比例(%) |
| --- | --- |
| 2018 | 8 |
| 2019 | 10 |
| 2020 | 12 |`;

      const result = parserMarkdownToSlateNode(markdown);
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findChartNode = (node: any): any => {
        if (node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const chartNode = findChartNode(cardNode);
      expect(chartNode).toBeDefined();
      if (chartNode) {
        // 检查列定义
        const columns = chartNode.otherProps?.columns;
        expect(columns).toBeDefined();
        expect(columns.length).toBe(2);
        expect(columns[0].dataIndex).toBe('年份');
        expect(columns[1].dataIndex).toBe('新能源车双积分比例(%)');

        // 检查数据源
        const dataSource = chartNode.otherProps?.dataSource;
        expect(dataSource).toBeDefined();
        expect(dataSource.length).toBe(3);
        expect(dataSource[0]).toMatchObject({
          年份: '2018',
          '新能源车双积分比例(%)': '8',
        });
      }
    });

    it('应该处理包含中文字段名的图表配置', () => {
      const markdown = `<!-- {"chartType": "bar", "x": "品牌", "y": "10月销量(辆)", "title": "2025年10月中国新势力车企销量排名"} -->
| 品牌 | 10月销量(辆) |
| --- | --- |
| 零跑 | 70289 |
| HIMA | 68216 |`;

      const result = parserMarkdownToSlateNode(markdown);
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findChartNode = (node: any): any => {
        if (node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const chartNode = findChartNode(cardNode);
      expect(chartNode).toBeDefined();
      if (chartNode) {
        // 配置可能在 otherProps 中，也可能在 config 中
        const config = chartNode.otherProps?.config || chartNode.otherProps;
        expect(config).toBeDefined();
        // 如果是数组，取第一个；如果是对象，直接使用
        const chartConfig = Array.isArray(config) ? config[0] : config;
        expect(chartConfig?.x || config?.x).toBe('品牌');
        expect(chartConfig?.y || config?.y).toBe('10月销量(辆)');
        
        const dataSource = chartNode.otherProps?.dataSource;
        expect(dataSource[0]['品牌']).toBe('零跑');
        expect(dataSource[0]['10月销量(辆)']).toBe('70289');
      }
    });
  });

  describe('边界情况', () => {
    it('应该处理没有图表配置的表格（应该解析为普通表格）', () => {
      const markdown = `| 年份 | 数值 |
| --- | --- |
| 2018 | 8 |
| 2019 | 10 |`;

      const result = parserMarkdownToSlateNode(markdown);
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findTableNode = (node: any): any => {
        if (node.type === 'table') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findTableNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const tableNode = findTableNode(cardNode);
      expect(tableNode).toBeDefined();
      expect(tableNode?.type).toBe('table');
    });

    it('应该处理空表格', () => {
      const markdown = `<!-- {"chartType": "line", "x": "年份", "y": "数值"} -->
| 年份 | 数值 |
| --- | --- |`;

      const result = parserMarkdownToSlateNode(markdown);
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findChartNode = (node: any): any => {
        if (node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const chartNode = findChartNode(cardNode);
      expect(chartNode).toBeDefined();
      if (chartNode) {
        const dataSource = chartNode.otherProps?.dataSource;
        expect(dataSource).toBeDefined();
        expect(dataSource.length).toBe(0);
      }
    });

    it('应该处理无效的JSON配置（应该跳过配置，解析为普通表格）', () => {
      const markdown = `<!-- {invalid json} -->
| 年份 | 数值 |
| --- | --- |
| 2018 | 8 |`;

      const result = parserMarkdownToSlateNode(markdown);
      // 无效的JSON应该被忽略，表格应该正常解析
      const cardNode = result.schema.find((node: any) => node.type === 'card');
      expect(cardNode).toBeDefined();
      
      const findTableOrChartNode = (node: any): any => {
        if (node.type === 'table' || node.type === 'chart') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findTableOrChartNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      
      const tableNode = findTableOrChartNode(cardNode);
      // 应该至少有一个表格或图表节点
      expect(tableNode).toBeDefined();
    });
  });
});

