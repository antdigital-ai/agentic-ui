---
name: gh-create-pr
description: 使用 GitHub CLI (gh) 推送当前分支并创建或更新 PR。在用户说「提 PR」「新建 PR」「用 gh 建 PR」「submit PR」「create pull request」时使用。
---

# 使用 gh 创建 / 更新 PR

## 何时使用

- 用户说：提 PR、新建 PR、用 gh 建 PR、submit PR、create pull request、开 PR
- 当前分支有未推送提交，需要推送到 origin 并创建或更新 PR

## 流程

### 1. 确认状态

```bash
git status -sb
git log -1 --oneline
```

- 若有未提交变更，先按项目规范提交（见下方「提交信息规范」）。
- 若 `[ahead N]`，需要先 push。

### 2. 推送当前分支

若当前分支领先 origin：

```bash
git push -u origin <当前分支名>
```

或简写（当前分支已跟踪 origin 时）：

```bash
git push origin
```

### 3. 创建 PR

```bash
gh pr create --base main --head <当前分支名> --title "<标题>" --body "<正文>"
```

- **--base**：目标分支，一般为 `main` 或 `master`，可与仓库默认分支一致。
- **--head**：当前分支；不写时 gh 会使用当前检出分支。
- 若该分支已有开放中的 PR，gh 会提示已存在并给出链接，不会重复创建。

### 4. 标题与正文

- **标题**：简短说明变更，可与最近一次 commit 的 summary 一致或稍作归纳。
- **正文**：可选；可包含「变更说明」「测试说明」「关联 Issue」等。若用户未指定，可用简洁模板，例如：

```markdown
## 变更说明

- （根据 commit 或改动简要列出）

> Submitted by Cursor
```

## 提交信息规范（本仓库）

提交时遵循既有规范：

- 格式：`Component: Emoji 描述` 或 `type(scope): description`
- Props、组件名用反引号；中英文之间加空格
- 多类变更按组件/类型分条写

示例：`MarkdownEditor: 优化 Jinja 模板（可访问性、错误处理、样式与单测）`

## 命令速查

| 步骤        | 命令                                                    |
| ----------- | ------------------------------------------------------- |
| 看状态      | `git status -sb`                                        |
| 推送        | `git push -u origin $(git branch --show-current)`       |
| 建 PR       | `gh pr create --base main --title "标题" --body "正文"` |
| 查看已有 PR | `gh pr list --head $(git branch --show-current)`        |

## 注意

- 执行 `gh` 前需已登录：`gh auth login`。
- 若遇 TLS / 证书错误，可带 `required_permissions: ["all"]` 再试。
- 创建 PR 需要网络权限。
