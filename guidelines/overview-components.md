## Components

Always prefer components from `@ant-design/agentic-ui` if they are available. This library is built on top of Ant Design (`antd`), so standard Ant Design components can also be used when no specific agentic component exists.

Here are the guidelines files for the core Agentic UI components:

| Component | Overview | Guidelines file |
|----------|----------|----------|
| Bubble | Chat message bubbles (User/AI) | [bubble.md](components/bubble.md) |
| ChatLayout | Main layout for chat interfaces | [chat-layout.md](components/chat-layout.md) |
| MarkdownEditor | Rich text editor for chat input | [markdown-editor.md](components/markdown-editor.md) |
| MarkdownInputField | Chat input with attachments & voice | [input.md](components/input.md) |
| ThoughtChainList | Visualization for reasoning steps | [thought-chain.md](components/thought-chain.md) |
| ToolUseBar | Display for tool usage/calls | [tool-use-bar.md](components/tool-use-bar.md) |
| TaskList | List of tasks/steps | [task-list.md](components/task-list.md) |
| WelcomeMessage | Initial welcome screen | [welcome-message.md](components/welcome-message.md) |

## General Component Usage and Best Practices

### Styling
- The project uses `@ant-design/cssinjs` and `antd` tokens.
- Avoid inline styles. Use `createStyles` or `style.ts` files.

### Common Patterns
- **Bubbles**: Used for the main conversation flow.
- **ThoughtChain**: Used to show the "thinking" process of the agent.
- **Markdown**: Both input and output often involve Markdown.
