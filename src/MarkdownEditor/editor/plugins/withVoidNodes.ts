import { Editor } from 'slate';
import { voidNode } from './utils';

/**
 * 扩展编辑器以识别空节点类型
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够识别空节点
 *
 * @description
 * 该插件扩展编辑器的 `isVoid` 方法，使其能够识别特定的空元素类型。
 * 空节点包括：'hr'、'break'
 *
 * 设计备注：`card` / `card-before` / `card-after` 故意 **不**注册为 void。
 * - `card` 内部承载可编辑内容（paragraph / image / table 等），void 会让 Slate
 *   把整张卡当成原子块，无法再正常编辑。
 * - `card-before` / `card-after` 是光标停泊位的空 span，依赖 Slate 的常规
 *   selection 行为。`card-after` 还要在 `withCardPlugin` 里拦截 `insertText`
 *   把输入挪到 card 之后；若注册为 void，键入会直接被 Slate 阻止，redirect
 *   逻辑无法触发。
 * card 系列的行为约束都由 `withCardPlugin` 在 apply / insertText /
 * insertFragment / deleteBackward 多个入口手动维护，调整顺序前请同步阅读。
 */
export const withVoidNodes = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return voidNode.has(element.type) || isVoid(element);
  };

  return editor;
};
