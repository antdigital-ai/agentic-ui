import { describe, expect, it } from 'vitest';
import { MarkdownFormatter } from '../index';

const previewText = `<!-- {"MarkdownType": "report", "id": "8", "section_ids": " [15, 16, 17] "} -->

# Umi 研究报告

<!-- {"MarkdownType": "section", "id": "15" } -->

## html

<font color="red">Umi 科技（深圳）有限公司</font>
<font color=#FE0300>哈哈哈</font>
<sup>Umi 科技（深圳）有限公司</sup>
<sub>Umi 科技（深圳）有限公司</sub>

#  <font color=#FE0300>*我是一个正经人*</font>
##  <font color=#70AD48>*我是一个正经人*</font>
###  <font color=#F6CCAC>*我是一个正经人*</font>

[知乎](https://www.zhihu.com/favicon.ico?x-oss-process=image%2Fquality%2Cq_10)

[<font color="red">知乎</font>](https://www.zhihu.com/favicon.ico?x-oss-process=image%2Fquality%2Cq_10)


Description: <strong>Full-Year 2024 Diluted EPS Up 24% to 15.88 and Adjusted Diluted EPS Up 9% to 13.17</strong> Expects 2025 To Be Another Year of Positive Revenue Growth for Crocs, Inc., Led by the Crocs Brand Upsizes Share Repurchase Authorization by 1 Billion Resulting in Total Authorization Outstanding of Approximately ...

<html><table><tbody><tr><td>序号</td><td>问题</td><td>答案</td></tr><tr><td>0.0</td><td>世界上最小的鸟是什么?</td><td>蜂鸟（Hummingbird）。蜂鸟是世界上最小的鸟类，其中最小的种类是蜂鸟科中的蜂鸟属（Melli</td></tr><tr><td>1.0</td><td>地球上最高的山峰是哪座?</td><td>珠穆朗玛峰（Mount Everest）。珠穆朗玛峰位于喜马拉雅山脉，海拔8848.86米，是地球上最</td></tr><tr><td>2.0</td><td>哪种动物的睡眠时间最长?</td><td>考拉（Koala）。考拉每天大约睡18-22小时，是已知睡眠时间最长的动物之一。</td></tr></tbody></table></html>`;

describe('MarkdownFormatter Preview', () => {
  describe('format', () => {
    it('should handle HTML content correctly', () => {
      const formatted = MarkdownFormatter.format(previewText);

      // 验证基本格式化
      expect(formatted).toContain('Umi 科技（深圳）有限公司');

      // 验证 HTML 标签保留
      expect(formatted).toContain('<font color="red">');
      expect(formatted).toContain('<strong>');
      expect(formatted).toContain('<table>');

      // 验证段落格式
      expect(formatted).toMatch(/# Umi 研究报告\n\n/);
      expect(formatted).toMatch(/## html\n\n/);
    });

    it('should preserve HTML table structure', () => {
      const formatted = MarkdownFormatter.format(previewText);

      // 验证表格结构完整性
      expect(formatted).toContain(
        '<table><tbody><tr><td>序号</td><td>问题</td><td>答案</td></tr>',
      );
      expect(formatted).toContain('</tbody></table>');
    });

    it('should handle HTML comments correctly', () => {
      const formatted = MarkdownFormatter.format(previewText);

      // 验证注释保留
      expect(formatted).toContain(
        '<!-- {"MarkdownType": "report", "id": "8", "section_ids": " [15, 16, 17] "} -->',
      );
      expect(formatted).toContain(
        '<!-- {"MarkdownType": "section", "id": "15" } -->',
      );
    });

    it('should handle markdown links correctly', () => {
      const formatted = MarkdownFormatter.format(previewText);

      // 验证链接格式
      expect(formatted).toContain(
        '[知乎](https://www.zhihu.com/favicon.ico?x-oss-process=image%2Fquality%2Cq_10)',
      );
      expect(formatted).toContain(
        '[<font color="red">知乎</font>](https://www.zhihu.com/favicon.ico?x-oss-process=image%2Fquality%2Cq_10)',
      );
    });
  });
});
