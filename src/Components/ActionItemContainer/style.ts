import { genStyleHooks, resetComponent } from '../../Hooks/useStyle';
import { genStyle } from '../ActionItemBox/style';

/**
 * ActionItemContainer 样式入口。
 *
 * 与 ActionItemBox 使用同一个 prefixCls（`agentic-chat-action-item-box`），
 * 因此复用同一份 `genStyle`。这里独立成一个 `useStyle`，避免 ActionItemContainer
 * 直接跨组件目录从 `../ActionItemBox` 导入实现细节。
 */
const useGenStyle = genStyleHooks('ActionItemContainer', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'ActionItemContainer');
  return { wrapSSR, hashId };
}
