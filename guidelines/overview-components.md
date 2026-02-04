## Components

Always prefer components from `@ant-design/agentic-ui` if they are available. This library is built on top of Ant Design (`antd`), so standard Ant Design components can also be used when no specific agentic component exists.

Here are the guidelines files for the core Agentic UI components:

| Component | Overview | Guidelines file | Source Path |
|----------|----------|----------|----------|
| Bubble | Chat message bubbles (User/AI) | [bubble.md](components/bubble.md) | `src/Bubble/index.tsx` |
| ChatLayout | Main layout for chat interfaces | [chat-layout.md](components/chat-layout.md) | `src/ChatLayout/index.tsx` |
| Loading | Loading indicator and spinner | [loading.md](components/loading.md) | `src/Components/Loading/index.tsx` |
| MarkdownEditor | Rich text editor for chat input | [markdown-editor.md](components/markdown-editor.md) | `src/MarkdownEditor/index.tsx` |
| MarkdownInputField | Chat input field | [input.md](components/input.md) | `src/MarkdownInputField/MarkdownInputField.tsx` |
| Robot | Robot avatar with states | [robot.md](components/robot.md) | `src/Components/Robot/index.tsx` |
| ThoughtChainList | Visualization for reasoning steps | [thought-chain.md](components/thought-chain.md) | `src/ThoughtChainList/index.tsx` |
| ToolUseBar | Display for tool usage/calls | [tool-use-bar.md](components/tool-use-bar.md) | `src/ToolUseBar/index.tsx` |
| TaskList | List of tasks/steps | [task-list.md](components/task-list.md) | `src/TaskList/index.tsx` |
| WelcomeMessage | Initial welcome screen | [welcome-message.md](components/welcome-message.md) | `src/WelcomeMessage/index.tsx` |
| Workspace | Multi-tab workspace (Browser, File, Task) | [workspace.md](components/workspace.md) | `src/Workspace/index.tsx` |

## General Component Usage and Best Practices

### Styling
- The project uses `@ant-design/cssinjs` and `antd` tokens.
- Avoid inline styles. Use `createStyles` or `style.ts` files.

### Common Patterns
- **Bubbles**: Used for the main conversation flow.
- **ThoughtChain**: Used to show the "thinking" process of the agent.
- **Markdown**: Both input and output often involve Markdown.
