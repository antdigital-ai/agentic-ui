/**
 * `useVoiceInputManager` 已迁移至 `src/MarkdownInputField/hooks/useVoiceInputManager.ts`。
 *
 * 本文件保留 re-export 兼容层，避免破坏 `MarkdownInputField.tsx` 中通过
 * `from './VoiceInputManager'` 引入的导入路径。
 *
 * 新代码请直接：
 *   `import { useVoiceInputManager } from '../hooks/useVoiceInputManager';`
 *
 * @deprecated 请改用 `src/MarkdownInputField/hooks/useVoiceInputManager`，
 * 本文件将在下一个大版本删除。
 */
export {
  useVoiceInputManager,
  type VoiceInputManagerProps,
  type VoiceInputManagerReturn,
} from '../hooks/useVoiceInputManager';
