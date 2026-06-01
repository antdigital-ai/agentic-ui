/**
 * BeforeToolContainer 已重命名并迁移至 `src/Components/ActionItemContainer/`。
 *
 * 此文件保留 re-export 兼容层，避免破坏既有的：
 *  - 公开 API：`import { ActionItemContainer } from '@ant-design/agentic-ui'`
 *  - 内部导入路径：`from '../BeforeToolContainer/BeforeToolContainer'`
 *
 * 新代码请直接：
 *   `import { ActionItemContainer } from '../../Components/ActionItemContainer';`
 *
 * @deprecated 请改用 `src/Components/ActionItemContainer`，本文件将在下一个大版本删除。
 */
export {
  ActionItemContainer,
  type ActionItemContainerProps,
} from '../../Components/ActionItemContainer';
