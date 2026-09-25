---
nav:
  title: 项目研发
  order: 3
group:
  title: 开发指南
  order: 3
---

# Pull Request 提交指南 {#pull-request}

本指南将帮助您了解如何正确地向 agentic-ui 项目提交 Pull Request (PR)，包括从分支创建到合并的完整流程。

## 📋 目录 {#toc}

- [前置准备](#前置准备)
- [分支管理策略](#分支管理策略)
- [提交规范](#提交规范)
- [创建 Pull Request](#创建-pull-request)
- [代码审查流程](#代码审查流程)
- [常见问题解决](#常见问题解决)

## 🚀 前置准备 {#prerequisites}

### 1. Fork 项目 {#fork}

如果您是外部贡献者，请先 Fork 项目到您的 GitHub 账户：

```bash
# 1. 在 GitHub 上点击 Fork 按钮 {#github-fork}
# 2. 克隆 Fork 的仓库到本地 {#fork-2}
git clone https://github.com/YOUR_USERNAME/agentic-ui.git
cd agentic-ui

# 3. 添加上游仓库 {#add-upstream}
git remote add upstream git@github.com:ant-design/agentic-ui.git

# 4. 验证远程仓库配置 {#config}
git remote -v
```

### 2. 环境设置 {#environment-setup}

```bash
# 安装依赖 {#install-dependencies}
pnpm install

# 启动开发服务器验证环境 {#verify-dev-server}
pnpm start
```

## 🌳 分支管理策略 {#branching-strategy}

### 分支命名规范 {#branch-naming}

```bash
# 功能分支 {#feature-branches}
feature/组件名称-功能描述
feature/markdown-editor-syntax-highlight

# 修复分支 {#fix-branches}
fix/问题描述
fix/memory-leak-in-editor

# 文档分支 {#docs-branches}
docs/文档类型
docs/api-reference

# 重构分支 {#refactor-branches}
refactor/重构范围
refactor/component-structure

# 性能优化分支 {#perf-branches}
perf/优化内容
perf/rendering-optimization
```

### 创建开发分支 {#create-dev-branch}

```bash
# 1. 确保在 main 分支 {#main}
git checkout main

# 2. 拉取最新代码 {#pull-latest}
git pull upstream main

# 3. 创建并切换到新分支 {#create-and-switch-branch}
git checkout -b feature/your-feature-name

# 4. 推送分支到远程仓库 {#push-branch-to-remote}
git push -u origin feature/your-feature-name
```

## 📝 提交规范 {#commit-conventions}

### Commit Message 格式 {#commit-message}

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型 (type) {#types-type}

- **feat**: 新功能
- **fix**: 错误修复
- **docs**: 文档更新
- **style**: 代码格式调整（不影响代码运行的变动）
- **refactor**: 重构（既不是新增功能，也不是修改bug的代码变动）
- **perf**: 性能优化
- **test**: 添加或修改测试
- **chore**: 构建过程或辅助工具的变动

### 示例 {#examples}

```bash
# 好的提交示例 {#example}
git commit -m "feat(editor): add syntax highlighting for code blocks"
git commit -m "fix(bubble): resolve memory leak in message rendering"
git commit -m "docs: update API documentation for MarkdownEditor"
git commit -m "test(editor): add unit tests for markdown parsing"

# 避免的提交示例 {#example-2}
git commit -m "fix bugs"
git commit -m "update code"
git commit -m "add new feature"
```

### 提交前检查清单 {#pre-commit-checklist}

在提交代码前，请确保：

- [ ] 代码通过 lint 检查：`pnpm lint`
- [ ] 所有测试通过：`pnpm test`
- [ ] 类型检查通过：`pnpm tsc`
- [ ] 代码格式化：`pnpm prettier`
- [ ] 更新相关文档
- [ ] 添加或更新测试用例

```bash
# 一键检查脚本 {#one-click-check-script}
pnpm lint && pnpm test && pnpm tsc
```

## 🔄 创建 Pull Request {#pull-request-2}

### 1. 推送代码 {#push-code}

```bash
# 确保代码已提交 {#ensure-committed}
git add .
git commit -m "feat(component): your feature description"

# 推送到远程分支 {#push-to-remote-branch}
git push origin feature/your-feature-name
```

### 2. 在 GitHub 上创建 PR {#github-pr}

1. 访问您的 Fork 仓库页面
2. 点击 "Compare & pull request" 按钮
3. 选择正确的分支：
   - **base**: `ant-design/agentic-ui` 的 `main` 分支
   - **compare**: 您的功能分支

### 3. PR 标题和描述 {#title-pr}

#### PR 标题格式 {#title-pr-2}

```
<type>(scope): <description>
```

#### PR 描述模板 {#pr}

```markdown
## 📖 变更描述 {#change-description}

简要描述此 PR 的目的和实现的功能。

## 🔧 变更类型 {#types}

- [ ] 新功能 (feature)
- [ ] 错误修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 样式调整 (style)
- [ ] 代码重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试相关 (test)
- [ ] 构建/工具相关 (chore)

## 🧪 测试 {#testing}

- [ ] 现有测试通过
- [ ] 添加了新的测试用例
- [ ] 手动测试验证功能正常

## 📸 截图/演示 {#demo}

如果有 UI 变更，请提供截图或 GIF 演示。

## 🔗 相关 Issue {#issue}

Closes #issue_number

## 📋 检查清单 {#checklist}

- [ ] 代码通过 lint 检查
- [ ] 所有测试通过
- [ ] 类型检查通过
- [ ] 更新了相关文档
- [ ] 遵循项目代码规范
- [ ] PR 标题符合规范
```

### 4. 标签和里程碑 {#tags-and-milestones}

适当添加标签：

- `feature` - 新功能
- `bug` - 错误修复
- `documentation` - 文档相关
- `enhancement` - 功能增强
- `performance` - 性能优化

## 👥 代码审查流程 {#code-review-process}

### 审查前准备 {#review-preparation}

确保您的 PR：

- [ ] 通过所有 CI 检查
- [ ] 代码覆盖率不降低
- [ ] 没有合并冲突
- [ ] 描述清晰完整

### 审查过程 {#review-process}

1. **自动检查**: CI 会自动运行测试和检查
2. **代码审查**: 维护者会审查代码质量、设计和实现
3. **反馈处理**: 根据审查意见修改代码
4. **最终审批**: 通过审查后合并到主分支

### 处理审查反馈 {#handle-review-feedback}

```bash
# 1. 在本地修改代码 {#edit-locally}
# 2. 提交修改 {#commit-changes}
git add .
git commit -m "fix: address review comments"

# 3. 推送更新 {#push-updates}
git push origin feature/your-feature-name
```

## 🔧 常见问题解决 {#troubleshooting}

### 1. 合并冲突解决 {#resolve-merge-conflicts}

```bash
# 1. 拉取最新的上游代码 {#pull-latest-upstream}
git fetch upstream
git checkout main
git merge upstream/main

# 2. 切换到功能分支 {#checkout-feature-branch}
git checkout feature/your-feature-name

# 3. 合并 main 分支 {#main-2}
git merge main

# 4. 解决冲突后提交 {#commit-after-conflicts}
git add .
git commit -m "resolve merge conflicts"

# 5. 推送更新 {#push-updates-2}
git push origin feature/your-feature-name
```

### 2. 修改提交历史 {#edit-commit-history}

```bash
# 修改最后一次提交 {#amend-last-commit}
git commit --amend -m "new commit message"

# 交互式 rebase (修改多个提交) {#rebase}
git rebase -i HEAD~n  # n 是要修改的提交数量

# 强制推送 (谨慎使用) {#force-push-caution}293} {#force-push-caution}
git push --force-with-lease origin feature/your-feature-name
```

### 3. CI 检查失败 {#ci}

```bash
# 本地运行相同的检查 {#run-checks-locally}
pnpm lint:es      # ESLint 检查
pnpm lint:css     # StyleLint 检查
pnpm test         # 单元测试
pnpm tsc          # TypeScript 类型检查
pnpm build        # 构建检查
```

### 4. 同步 Fork 仓库 {#fork-3}

```bash
# 1. 拉取上游更新 {#pull-upstream-updates}
git fetch upstream

# 2. 切换到 main 分支 {#main-3}
git checkout main

# 3. 合并上游更新 {#merge-upstream-updates}317} {#merge-upstream-updates}
git merge upstream/main

# 4. 推送到您的 Fork {#fork-4}
git push origin main
```

## 📚 最佳实践 {#best-practices}

### 1. 保持 PR 简洁 {#pr-2}

- 一个 PR 只解决一个问题
- 避免包含不相关的变更
- 保持代码变更在合理范围内

### 2. 及时同步 {#sync-promptly}

- 定期同步上游仓库
- 及时解决合并冲突
- 保持分支整洁

### 3. 完善的测试 {#thorough-tests}

- 为新功能添加测试
- 确保测试覆盖率
- 包含边界情况测试

### 4. 清晰的文档 {#clear-docs}

- 更新 API 文档
- 添加使用示例
- 更新 CHANGELOG

## 🎯 质量标准 {#quality-standards}

### 代码质量 {#code-quality}

- 遵循 ESLint 规则
- 保持一致的代码风格
- 适当的注释和文档
- 合理的变量和函数命名

### 性能标准 {#performance-standards}

- 避免不必要的重新渲染
- 优化大数据量处理
- 合理使用缓存机制
- 监控内存使用

### 兼容性 {#compatibility}

- 支持主流浏览器
- React 版本兼容性
- TypeScript 严格模式
- 无障碍访问支持

## 📞 获得帮助 {#getting-help}

如果在 PR 过程中遇到问题：

1. 查看[开发指南](./development-guide.md)
2. 搜索相关 [Issues](https://github.com/ant-design/agentic-ui/issues)
3. 在 [Discussions](https://github.com/ant-design/agentic-ui/discussions) 中提问
4. 联系维护者

---

感谢您的贡献！每个 PR 都让 agentic-ui 变得更好。🎉
