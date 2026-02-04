import { expect, test } from '../tests/fixtures/page-fixture';

/**
 * KeyboardTask 快捷键功能 E2E 测试
 * 测试 keyboard.ts 中定义的所有键盘快捷键功能
 */
test.describe('KeyboardTask 快捷键功能', () => {
  test.beforeEach(async ({ markdownEditorPage }) => {
    await markdownEditorPage.goto('markdowneditor-demo-1');
    await markdownEditorPage.focus();
  });

  test.describe('选择相关快捷键', () => {
    test('Cmd/Ctrl+A 应该全选编辑器内容', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Test content for select all');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+A
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(100);

      // 输入新文本替换选中内容
      await page.keyboard.type('Replaced');
      const text = await markdownEditorPage.getText();
      expect(text).toContain('Replaced');
      expect(text).not.toContain('Test content');
    });

    test('Cmd/Ctrl+Shift+L 应该选择当前行', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Line 1');
      await markdownEditorPage.pressKey('Enter');
      await markdownEditorPage.typeText('Line 2');
      await markdownEditorPage.pressKey('Enter');
      await markdownEditorPage.typeText('Line 3');

      // 将光标移动到第二行中间
      await markdownEditorPage.pressKey('ArrowUp');
      await markdownEditorPage.pressKey('Home');

      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+Shift+L 选择当前行
      await page.keyboard.press(`${modifierKey}+Shift+l`);
      await page.waitForTimeout(100);

      // 输入替换文本
      await page.keyboard.type('Selected Line');
      const text = await markdownEditorPage.getText();
      expect(text).toContain('Selected Line');
    });

    test('Cmd/Ctrl+D 应该选择当前单词或汉字', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('hello world test');
      // 将光标移动到 "world" 中间
      await markdownEditorPage.pressKey('Home');
      for (let i = 0; i < 6; i++) {
        await markdownEditorPage.pressKey('ArrowRight');
      }

      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+D 选择单词
      await page.keyboard.press(`${modifierKey}+d`);
      await page.waitForTimeout(100);

      // 输入替换文本
      await page.keyboard.type('replaced');
      const text = await markdownEditorPage.getText();
      expect(text).toContain('replaced');
    });

    test('Cmd/Ctrl+D 应该选择中文字符', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('你好世界测试');
      // 将光标移动到 "世界" 中间
      await markdownEditorPage.pressKey('Home');
      for (let i = 0; i < 2; i++) {
        await markdownEditorPage.pressKey('ArrowRight');
      }

      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+D 选择汉字
      await page.keyboard.press(`${modifierKey}+d`);
      await page.waitForTimeout(100);

      // 输入替换文本
      await page.keyboard.type('替换');
      const text = await markdownEditorPage.getText();
      expect(text).toContain('替换');
    });
  });

  test.describe('标题相关快捷键', () => {
    test('Cmd/Ctrl+1 应该设置为一级标题', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Heading 1');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+1
      await page.keyboard.press(`${modifierKey}+1`);
      await page.waitForTimeout(200);

      // 验证标题样式（通过检查 DOM 结构）
      const isHeading = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return false;
          const range = selection.getRangeAt(0);
          const commonNode = range.commonAncestorContainer;
          let node: Node | null =
            commonNode.nodeType === Node.TEXT_NODE
              ? commonNode.parentElement
              : (commonNode as HTMLElement);
          
          // 向上遍历 DOM 树，查找具有 data-be="head" 的元素
          while (node && node !== el) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).getAttribute('data-be') === 'head'
            ) {
              return true;
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(isHeading).toBe(true);
    });

    test('Cmd/Ctrl+2 应该设置为二级标题', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Heading 2');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      await page.keyboard.press(`${modifierKey}+2`);
      await page.waitForTimeout(200);

      const isHeading = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return false;
          const range = selection.getRangeAt(0);
          const commonNode = range.commonAncestorContainer;
          let node: Node | null =
            commonNode.nodeType === Node.TEXT_NODE
              ? commonNode.parentElement
              : (commonNode as HTMLElement);
          
          // 向上遍历 DOM 树，查找具有 data-be="head" 的元素
          while (node && node !== el) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).getAttribute('data-be') === 'head'
            ) {
              return true;
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(isHeading).toBe(true);
    });

    test('Cmd/Ctrl+3 应该设置为三级标题', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Heading 3');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      await page.keyboard.press(`${modifierKey}+3`);
      await page.waitForTimeout(200);

      const isHeading = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return false;
          const range = selection.getRangeAt(0);
          const commonNode = range.commonAncestorContainer;
          let node: Node | null =
            commonNode.nodeType === Node.TEXT_NODE
              ? commonNode.parentElement
              : (commonNode as HTMLElement);
          
          // 向上遍历 DOM 树，查找具有 data-be="head" 的元素
          while (node && node !== el) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).getAttribute('data-be') === 'head'
            ) {
              return true;
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(isHeading).toBe(true);
    });

    test('Cmd/Ctrl+4 应该转换为普通段落', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Heading Text');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 先设置为标题
      await page.keyboard.press(`${modifierKey}+1`);
      await page.waitForTimeout(200);

      // 再按 Cmd/Ctrl+4 转换为段落
      await page.keyboard.press(`${modifierKey}+4`);
      await page.waitForTimeout(200);

      const isParagraph = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return false;
          const range = selection.getRangeAt(0);
          const commonNode = range.commonAncestorContainer;
          let node: Node | null =
            commonNode.nodeType === Node.TEXT_NODE
              ? commonNode.parentElement
              : (commonNode as HTMLElement);
          
          // 向上遍历 DOM 树，查找具有 data-be="paragraph" 的元素
          while (node && node !== el) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).getAttribute('data-be') === 'paragraph'
            ) {
              return true;
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(isParagraph).toBe(true);
    });

    test('Cmd/Ctrl+0 应该转换为普通段落', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Heading Text');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 先设置为标题
      await page.keyboard.press(`${modifierKey}+1`);
      await page.waitForTimeout(200);

      // 再按 Cmd/Ctrl+0 转换为段落
      await page.keyboard.press(`${modifierKey}+0`);
      await page.waitForTimeout(200);

      const isParagraph = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return false;
          const range = selection.getRangeAt(0);
          const commonNode = range.commonAncestorContainer;
          let node: Node | null =
            commonNode.nodeType === Node.TEXT_NODE
              ? commonNode.parentElement
              : (commonNode as HTMLElement);
          
          // 向上遍历 DOM 树，查找具有 data-be="paragraph" 的元素
          while (node && node !== el) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).getAttribute('data-be') === 'paragraph'
            ) {
              return true;
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(isParagraph).toBe(true);
    });

    test('Cmd/Ctrl+] 应该增加标题级别（标题变小）', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Test Heading');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 先设置为1级标题
      await page.keyboard.press(`${modifierKey}+1`);
      await page.waitForTimeout(200);

      // 按 Cmd/Ctrl+] 增加级别（应该变成段落）
      await page.keyboard.press(`${modifierKey}+]`);
      await page.waitForTimeout(200);

      const text = await markdownEditorPage.getText();
      expect(text).toContain('Test Heading');
    });

    test('Cmd/Ctrl+[ 应该降低标题级别（标题变大）', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Test Heading');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+[ 降低级别（段落变成1级标题）
      await page.keyboard.press(`${modifierKey}+[`);
      await page.waitForTimeout(200);

      const isHeading = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return false;
          const range = selection.getRangeAt(0);
          const commonNode = range.commonAncestorContainer;
          let node: Node | null =
            commonNode.nodeType === Node.TEXT_NODE
              ? commonNode.parentElement
              : (commonNode as HTMLElement);
          
          // 向上遍历 DOM 树，查找具有 data-be="head" 的元素
          while (node && node !== el) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).getAttribute('data-be') === 'head'
            ) {
              return true;
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(isHeading).toBe(true);
    });
  });

  test.describe('插入元素快捷键', () => {
    test('Option/Alt+Q 应该插入引用块', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Quote text');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Alt';

      // 按 Option/Alt+Q
      await page.keyboard.press(`${modifierKey}+q`);
      await page.waitForTimeout(200);

      // 验证引用块存在
      const hasBlockquote = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const blockquotes = el.querySelectorAll('[data-be="blockquote"]');
          return blockquotes.length > 0;
        },
      );
      expect(hasBlockquote).toBe(true);
    });

    test('Option/Alt+Q 应该移除现有引用块', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Quote text');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Alt';

      // 先插入引用块
      await page.keyboard.press(`${modifierKey}+q`);
      await page.waitForTimeout(200);

      // 再次按 Option/Alt+Q 移除引用块
      await page.keyboard.press(`${modifierKey}+q`);
      await page.waitForTimeout(200);

      const hasBlockquote = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const blockquotes = el.querySelectorAll('[data-be="blockquote"]');
          return blockquotes.length > 0;
        },
      );
      expect(hasBlockquote).toBe(false);
    });

    test('Cmd/Ctrl+Option/Alt+T 应该插入表格', async ({
      markdownEditorPage,
      page,
    }) => {
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      const optionKey = isMac ? 'Meta' : 'Alt';

      // 按 Cmd/Ctrl+Option/Alt+T
      if (isMac) {
        await page.keyboard.press(`${modifierKey}+${optionKey}+t`);
      } else {
        await page.keyboard.press(`${modifierKey}+Alt+t`);
      }
      await page.waitForTimeout(500);

      // 验证表格存在
      const hasTable = await markdownEditorPage.editableInput.evaluate((el) => {
        const tables = el.querySelectorAll('table');
        return tables.length > 0;
      });
      expect(hasTable).toBe(true);
    });

    test('Cmd/Ctrl+Option/Alt+C 应该插入代码块', async ({
      markdownEditorPage,
      page,
    }) => {
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      const optionKey = isMac ? 'Meta' : 'Alt';

      // 按 Cmd/Ctrl+Option/Alt+C
      if (isMac) {
        await page.keyboard.press(`${modifierKey}+${optionKey}+c`);
      } else {
        await page.keyboard.press(`${modifierKey}+Alt+c`);
      }
      await page.waitForTimeout(500);

      // 验证代码块存在
      const hasCodeBlock = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const codeBlocks = el.querySelectorAll('[data-be="code"]');
          return codeBlocks.length > 0;
        },
      );
      expect(hasCodeBlock).toBe(true);
    });



  });

  test.describe('列表相关快捷键', () => {
    test('Cmd/Ctrl+Option/Alt+O 应该创建有序列表', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('List item');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      const optionKey = isMac ? 'Meta' : 'Alt';

      // 按 Cmd/Ctrl+Option/Alt+O
      if (isMac) {
        await page.keyboard.press(`${modifierKey}+${optionKey}+o`);
      } else {
        await page.keyboard.press(`${modifierKey}+Alt+o`);
      }
      await page.waitForTimeout(300);

      // 验证有序列表存在
      // 有序列表使用 <ol> 标签，而不是 data-order 属性
      const hasOrderedList = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          // 查找所有列表容器
          const listContainers = el.querySelectorAll('[data-be="list"]');
          for (let i = 0; i < listContainers.length; i++) {
            const container = listContainers[i] as HTMLElement;
            // 在容器内查找 <ol> 元素（有序列表）
            const ol = container.querySelector('ol');
            if (ol) {
              return true;
            }
          }
          return false;
        },
      );
      expect(hasOrderedList).toBe(true);
    });

    test('Cmd/Ctrl+Option/Alt+U 应该创建无序列表', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('List item');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      const optionKey = isMac ? 'Meta' : 'Alt';

      // 按 Cmd/Ctrl+Option/Alt+U
      if (isMac) {
        await page.keyboard.press(`${modifierKey}+${optionKey}+u`);
      } else {
        await page.keyboard.press(`${modifierKey}+Alt+u`);
      }
      await page.waitForTimeout(300);

      // 验证无序列表存在
      // 无序列表使用 <ul> 标签
      const hasUnorderedList = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          // 查找所有列表容器
          const listContainers = el.querySelectorAll('[data-be="list"]');
          for (let i = 0; i < listContainers.length; i++) {
            const container = listContainers[i] as HTMLElement;
            // 在容器内查找 <ul> 元素（无序列表，且不是任务列表）
            const ul = container.querySelector('ul');
            if (ul && ul.getAttribute('data-task') !== 'true') {
              return true;
            }
          }
          return false;
        },
      );
      expect(hasUnorderedList).toBe(true);
    });

    test('Cmd/Ctrl+Option/Alt+S 应该创建任务列表', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Task item');
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      const optionKey = isMac ? 'Meta' : 'Alt';

      // 按 Cmd/Ctrl+Option/Alt+S
      if (isMac) {
        await page.keyboard.press(`${modifierKey}+${optionKey}+s`);
      } else {
        await page.keyboard.press(`${modifierKey}+Alt+s`);
      }
      await page.waitForTimeout(300);

      // 验证任务列表存在
      // data-task 属性在 <ul> 或 <ol> 元素上，而不是在 [data-be="list"] 容器上
      const hasTaskList = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          // 查找所有列表容器
          const listContainers = el.querySelectorAll('[data-be="list"]');
          for (let i = 0; i < listContainers.length; i++) {
            const container = listContainers[i] as HTMLElement;
            // 在容器内查找 <ul> 或 <ol> 元素
            const ul = container.querySelector('ul');
            const ol = container.querySelector('ol');
            const listElement = ul || ol;
            if (listElement && listElement.getAttribute('data-task') === 'true') {
              return true;
            }
          }
          return false;
        },
      );
      expect(hasTaskList).toBe(true);
    });
  });

  test.describe('文本格式快捷键', () => {
    test('Cmd/Ctrl+B 应该切换加粗格式', async ({
      markdownInputFieldPage,
      page,
    }) => {
      // 使用 markdowninputfield-demo-0
      await markdownInputFieldPage.goto('markdowninputfield-demo-0');
      
      // 先清空编辑器内容，确保测试环境干净
      // 直接执行 Ctrl+A 和 Delete，不使用 clear() 方法
      await markdownInputFieldPage.focus();
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';
      
      // 全选
      await page.keyboard.press(`${modifierKey}+a`);
      await page.waitForTimeout(200); // 增加等待时间确保全选完成
      
      // 删除
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300); // 等待删除完成
      
      // 验证编辑器已清空
      await expect
        .poll(async () => await markdownInputFieldPage.getText(), {
          timeout: 2000,
        })
        .toBe('');

      // 输入新文本
      await markdownInputFieldPage.typeText('Bold text');
      await markdownInputFieldPage.selectAll();

      // 按 Cmd/Ctrl+B
      await page.keyboard.press(`${modifierKey}+b`);
      await page.waitForTimeout(300);

      // 验证加粗格式（通过检查文本是否包含加粗标记）
      // 加粗格式通过 fontWeight: 'bold' 样式和 data-testid="markdown-bold" 属性渲染
      // 使用 expect.poll 等待格式应用完成
      await expect
        .poll(
          async () => {
            const hasBold = await markdownInputFieldPage.editableInput.evaluate(
              (el) => {
                // 查找包含 "Bold text" 的文本节点
                const walker = document.createTreeWalker(
                  el,
                  NodeFilter.SHOW_TEXT,
                  null,
                );
                let textNode: Node | null = null;
                while (walker.nextNode()) {
                  if (
                    walker.currentNode.textContent?.trim() === 'Bold text'
                  ) {
                    textNode = walker.currentNode;
                    break;
                  }
                }

                if (!textNode) return false;

                // 向上遍历 DOM 树，查找加粗格式
                let node: Node | null = textNode.parentElement;
                while (node && node !== el) {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;
                    // 检查 data-testid="markdown-bold" 属性
                    if (
                      element.getAttribute('data-testid') === 'markdown-bold'
                    ) {
                      return true;
                    }
                    // 检查 fontWeight 样式
                    const computedStyle = window.getComputedStyle(element);
                    if (
                      computedStyle.fontWeight === 'bold' ||
                      computedStyle.fontWeight === '700' ||
                      parseInt(computedStyle.fontWeight) >= 700
                    ) {
                      return true;
                    }
                  }
                  node = node.parentElement;
                }
                return false;
              },
            );
            return hasBold;
          },
          {
            timeout: 3000,
            message: '等待加粗格式应用完成',
          },
        )
        .toBe(true);
    });

    test('Cmd/Ctrl+I 应该切换斜体格式', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Italic text');
      await markdownEditorPage.selectAll();
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+I
      await page.keyboard.press(`${modifierKey}+i`);
      await page.waitForTimeout(200);

      // 验证斜体格式
      // 斜体格式通过 fontStyle: 'italic' 样式渲染
      const hasItalic = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          // 查找包含 "Italic text" 的文本节点
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
          let textNode: Node | null = null;
          while (walker.nextNode()) {
            if (walker.currentNode.textContent?.includes('Italic text')) {
              textNode = walker.currentNode;
              break;
            }
          }
          
          if (!textNode) return false;
          
          // 向上遍历 DOM 树，查找斜体格式
          let node: Node | null = textNode.parentElement;
          while (node && node !== el) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              // 检查 fontStyle 样式
              const computedStyle = window.getComputedStyle(element);
              if (computedStyle.fontStyle === 'italic') {
                return true;
              }
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(hasItalic).toBe(true);
    });

    test('Cmd/Ctrl+Shift+S 应该切换删除线格式', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Strikethrough text');
      await markdownEditorPage.selectAll();
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+Shift+S
      await page.keyboard.press(`${modifierKey}+Shift+s`);
      await page.waitForTimeout(200);

      // 验证删除线格式
      // 删除线格式通过 <s> 标签渲染
      const hasStrikethrough = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          // 查找包含 "Strikethrough text" 的文本节点
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
          let textNode: Node | null = null;
          while (walker.nextNode()) {
            if (walker.currentNode.textContent?.includes('Strikethrough text')) {
              textNode = walker.currentNode;
              break;
            }
          }
          
          if (!textNode) return false;
          
          // 向上遍历 DOM 树，查找删除线格式
          let node: Node | null = textNode.parentElement;
          while (node && node !== el) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              // 检查 <s> 或 <del> 标签
              if (element.tagName === 'S' || element.tagName === 'DEL') {
                return true;
              }
              // 检查 textDecoration 样式
              const computedStyle = window.getComputedStyle(element);
              if (computedStyle.textDecoration.includes('line-through')) {
                return true;
              }
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(hasStrikethrough).toBe(true);
    });

    test('Option/Alt+` 应该切换行内代码格式', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Code text');
      await markdownEditorPage.selectAll();
      const isMac = process.platform === 'darwin';

      // 按 Option/Alt+` (反引号)
      // 使用 keyboard.down/up 来模拟组合键，因为反引号字符在字符串中需要特殊处理
      if (isMac) {
        await page.keyboard.down('Meta');
        await page.keyboard.press('`');
        await page.keyboard.up('Meta');
      } else {
        await page.keyboard.down('Alt');
        await page.keyboard.press('`');
        await page.keyboard.up('Alt');
      }
      await page.waitForTimeout(200);

      // 验证行内代码格式
      // 行内代码格式通过 <code> 标签渲染
      const hasCode = await markdownEditorPage.editableInput.evaluate((el) => {
        // 查找包含 "Code text" 的文本节点
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        let textNode: Node | null = null;
        while (walker.nextNode()) {
          if (walker.currentNode.textContent?.includes('Code text')) {
            textNode = walker.currentNode;
            break;
          }
        }
        
        if (!textNode) return false;
        
        // 向上遍历 DOM 树，查找行内代码格式
        let node: Node | null = textNode.parentElement;
        while (node && node !== el) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName === 'CODE') {
              return true;
            }
          }
          node = node.parentElement;
        }
        return false;
      });
      expect(hasCode).toBe(true);
    });

    test('Cmd/Ctrl+\\ 应该清除所有文本格式', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Formatted text');
      await markdownEditorPage.selectAll();
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 先应用加粗格式
      await page.keyboard.press(`${modifierKey}+b`);
      await page.waitForTimeout(200);

      // 再按 Cmd/Ctrl+\ 清除格式
      await page.keyboard.press(`${modifierKey}+\\`);
      await page.waitForTimeout(200);

      // 验证格式已清除（文本应该不再有加粗样式）
      const hasFormat = await markdownEditorPage.editableInput.evaluate(
        (el) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return false;
          const range = selection.getRangeAt(0);
          const commonNode = range.commonAncestorContainer;
          let node: Node | null =
            commonNode.nodeType === Node.TEXT_NODE
              ? commonNode.parentElement
              : (commonNode as HTMLElement);
          
          // 向上遍历 DOM 树，检查是否还有加粗格式
          while (node && node !== el) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (
                element.tagName === 'STRONG' ||
                element.tagName === 'B' ||
                window.getComputedStyle(element).fontWeight === 'bold'
              ) {
                return true;
              }
            }
            node = node.parentElement;
          }
          return false;
        },
      );
      expect(hasFormat).toBe(false);
    });
  });

  test.describe('粘贴相关快捷键', () => {
    test('Cmd/Ctrl+Shift+V 应该粘贴纯文本（无格式）', async ({
      markdownEditorPage,
      page,
    }) => {
      // 先输入并复制带格式的文本
      await markdownEditorPage.typeText('Formatted text');
      await markdownEditorPage.selectAll();
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 复制
      await page
        .context()
        .grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.keyboard.press(`${modifierKey}+c`);
      await page.waitForTimeout(200);

      // 清空编辑器
      await markdownEditorPage.clear();

      // 按 Cmd/Ctrl+Shift+V 粘贴纯文本
      await page.keyboard.press(`${modifierKey}+Shift+v`);
      await page.waitForTimeout(300);

      // 验证文本已粘贴
      const text = await markdownEditorPage.getText();
      expect(text).toContain('Formatted text');
    });
  });

  test.describe('历史操作快捷键', () => {
    test('Cmd/Ctrl+Z 应该撤销操作', async ({ markdownEditorPage, page }) => {
      await markdownEditorPage.typeText('Original text');
      const beforeText = await markdownEditorPage.getText();
      expect(beforeText).toContain('Original text');

      // 删除文本
      await markdownEditorPage.selectAll();
      await page.keyboard.press('Delete');
      await page.waitForTimeout(200);

      const afterDelete = await markdownEditorPage.getText();
      expect(afterDelete.length).toBeLessThan(beforeText.length);

      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 按 Cmd/Ctrl+Z 撤销
      await page.keyboard.press(`${modifierKey}+z`);
      await page.waitForTimeout(300);

      // 验证文本已恢复
      const afterUndo = await markdownEditorPage.getText();
      expect(afterUndo).toContain('Original text');
    });

    test('Cmd/Ctrl+Shift+Z 或 Cmd/Ctrl+Y 应该重做操作', async ({
      markdownEditorPage,
      page,
    }) => {
      await markdownEditorPage.typeText('Original text');
      const beforeText = await markdownEditorPage.getText();

      // 删除文本
      await markdownEditorPage.selectAll();
      await page.keyboard.press('Delete');
      await page.waitForTimeout(200);

      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 撤销
      await page.keyboard.press(`${modifierKey}+z`);
      await page.waitForTimeout(200);

      // 重做（Mac 使用 Cmd+Shift+Z，Windows 使用 Ctrl+Y）
      if (isMac) {
        await page.keyboard.press(`${modifierKey}+Shift+z`);
      } else {
        await page.keyboard.press(`${modifierKey}+y`);
      }
      await page.waitForTimeout(300);

      // 验证文本已重新删除
      const afterRedo = await markdownEditorPage.getText();
      expect(afterRedo.length).toBeLessThan(beforeText.length);
    });
  });

  test.describe('组合快捷键测试', () => {
    test('应该支持多个快捷键连续操作', async ({ markdownEditorPage, page }) => {
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 输入文本
      await markdownEditorPage.typeText('Test content');
      await markdownEditorPage.selectAll();

      // 应用加粗
      await page.keyboard.press(`${modifierKey}+b`);
      await page.waitForTimeout(100);

      // 应用斜体
      await page.keyboard.press(`${modifierKey}+i`);
      await page.waitForTimeout(100);

      // 验证文本仍然存在
      const text = await markdownEditorPage.getText();
      expect(text).toContain('Test content');
    });

    test('应该支持在标题中应用格式', async ({ markdownEditorPage, page }) => {
      const isMac = process.platform === 'darwin';
      const modifierKey = isMac ? 'Meta' : 'Control';

      // 输入文本并设置为标题
      await markdownEditorPage.typeText('Formatted Heading');
      await page.keyboard.press(`${modifierKey}+1`);
      await page.waitForTimeout(200);

      // 选中文本并应用加粗
      await markdownEditorPage.selectAll();
      await page.keyboard.press(`${modifierKey}+b`);
      await page.waitForTimeout(200);

      // 验证文本仍然存在
      const text = await markdownEditorPage.getText();
      expect(text).toContain('Formatted Heading');
    });
  });
});
