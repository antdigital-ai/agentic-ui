---
nav:
  title: 项目研发
  order: 3
group:
  title: 开发指南
  order: 4
---

# 发布测试版本指南 {#publish-beta-guide}

本指南详细介绍了如何发布 agentic-ui 的测试版本，包括版本管理、发布流程和测试验证。

## 🚀 快速发布 {#quick-release}

```bash
# 1. 准备工作 {#preparation}
git checkout main && git pull origin main
pnpm lint && pnpm test && pnpm build

# 2. 发布 Alpha 版本 {#alpha}
npm version prerelease --preid=alpha
npm publish --tag=alpha
git push origin main --follow-tags

# 3. 发布 Beta 版本 {#beta}
npm version prerelease --preid=beta
npm publish --tag=beta
git push origin main --follow-tags

# 4. 发布 RC 版本 {#rc}
npm version prerelease --preid=rc
npm publish --tag=next
git push origin main --follow-tags
```

## 📋 目录 {#toc}

- [版本管理策略](#版本管理策略)
- [预发布准备](#预发布准备)
- [发布测试版本](#发布测试版本)
- [版本验证](#版本验证)
- [回滚策略](#回滚策略)
- [完整发布流程](#完整发布流程)

## 📦 版本管理策略 {#versioning-strategy}

### 版本号规范 {#version-naming}

我们遵循 [语义化版本控制 (SemVer)](https://semver.org/lang/zh-CN/) 规范：

```
主版本号.次版本号.修订号[-预发布标识符]

例如：
1.26.55          // 正式版本
1.27.0-alpha.1   // Alpha 测试版
1.27.0-beta.1    // Beta 测试版
1.27.0-rc.1      // Release Candidate
```

### 版本类型说明 {#notes-types}

| 版本类型 | 标识符     | 用途                       | 稳定性   |
| -------- | ---------- | -------------------------- | -------- |
| Alpha    | `-alpha.x` | 内部测试，功能不完整       | 不稳定   |
| Beta     | `-beta.x`  | 功能完整，可能有已知问题   | 相对稳定 |
| RC       | `-rc.x`    | 发布候选版本，准备正式发布 | 稳定     |

### 分支策略 {#branch-strategy}

```
main                    # 主分支，稳定版本
├── develop            # 开发分支，最新开发代码
├── release/v1.27.0    # 发布分支，准备发布的代码
└── hotfix/v1.26.56    # 热修复分支，紧急修复
```

## 🚀 预发布准备 {#pre-release-prep}

### 1. 环境检查 {#env-check}

```bash
# 检查 Node.js 版本 {#node-js}
node --version  # >= 16.0.0

# 检查 pnpm 版本 {#pnpm}
pnpm --version  # >= 7.0.0

# 检查 npm 登录状态 {#status-npm}
npm whoami

# 检查 npm 仓库配置 {#config-npm}
npm config get registry
```

### 2. 代码准备 {#code-preparation}

```bash
# 1. 确保在 main 分支 {#main}
git checkout main

# 2. 拉取最新代码 {#pull-latest}
git pull origin main

# 3. 确保工作区干净 {#ensure-clean-worktree}
git status

# 4. 创建发布分支 {#create-release-branch}
git checkout -b release/v1.27.0
```

### 3. 代码质量检查 {#code-quality-check}

```bash
# 代码格式检查 {#format-check}
pnpm lint

# 类型检查 {#types}
pnpm tsc

# 运行所有测试 {#run-all-tests}
pnpm test

# 生成测试覆盖率报告 {#coverage-report}
pnpm test:coverage

# 构建项目 {#build-project}
pnpm build

# 检查构建产物 {#verify-build-output}
pnpm doctor
```

### 4. 依赖检查 {#dependency-check}

```bash
# 检查过期依赖 {#check-outdated-deps}
pnpm outdated

# 检查安全漏洞 {#security-audit}
pnpm audit

# 更新 lock 文件 {#lock}
pnpm install --frozen-lockfile
```

## 🏷️ 发布测试版本 {#publish-beta}

### 1. 版本号更新 {#version-bump}

#### 自动更新版本号 {#auto-version-bump}

```bash
# Alpha 版本 {#alpha-2}
npm version prerelease --preid=alpha
# 输出：v1.27.0-alpha.1 {#v1-alpha}

# Beta 版本 {#beta-2}
npm version prerelease --preid=beta
# 输出：v1.27.0-beta.1 {#v1-beta}

# RC 版本 {#rc-2}
npm version prerelease --preid=rc
# 输出：v1.27.0-rc.1 {#v1-rc}
```

#### 手动更新版本号 {#manual-version-bump}

编辑 `package.json` 文件：

```json
{
  "name": "@ant-design/agentic-ui",
  "version": "1.27.0-alpha.1"
  // ...
}
```

### 2. 更新变更日志 {#update-changelog}

创建或更新 `CHANGELOG.md`：

```markdown
## [1.27.0-alpha.1] - 2024-12-09

### 新增功能 {#new-features}

- 添加新的语法高亮主题
- 支持自定义工具栏配置

### 错误修复 {#bug-fixes}

- 修复编辑器内存泄漏问题
- 解决移动端滚动异常

### 性能优化 {#performance}

- 优化大文档渲染性能
- 减少不必要的重新渲染

### 破坏性变更 {#breaking-changes}

- 移除已废弃的 API
```

### 3. 构建和发布 {#build-and-publish}

```bash
# 1. 清理之前的构建 {#clean-previous-builds}
rm -rf dist/

# 2. 构建项目 {#build-project-2}
pnpm build

# 3. 发布到 npm (带标签) {#npm}
# Alpha 版本 {#alpha-3}
npm publish --tag=alpha

# Beta 版本 {#beta-3}
npm publish --tag=beta

# RC 版本 {#rc-3}
npm publish --tag=next
```

#### 发布标签说明 {#notes}

| 版本类型 | npm 标签 | 安装命令                                   | 说明             |
| -------- | -------- | ------------------------------------------ | ---------------- |
| Alpha    | `alpha`  | `npm install @ant-design/agentic-ui@alpha` | 最新开发版本     |
| Beta     | `beta`   | `npm install @ant-design/agentic-ui@beta`  | 测试版本         |
| RC       | `next`   | `npm install @ant-design/agentic-ui@next`  | 候选发布版本     |
| 正式版   | `latest` | `npm install @ant-design/agentic-ui`       | 稳定版本（默认） |

### 4. 推送代码和标签 {#push-code-and-tags}

```bash
# 1. 提交版本更新 {#commit-version-update}
git add .
git commit -m "chore(release): publish v1.27.0-alpha.1"

# 2. 创建标签 {#create-tag}
git tag v1.27.0-alpha.1

# 3. 推送代码和标签 {#push-code-and-tags-2}
git push origin release/v1.27.0
git push origin v1.27.0-alpha.1
```

## ✅ 版本验证 {#version-verification}

### 1. 安装测试 {#install-test}

```bash
# 在新目录中测试安装 {#test-install-in-new-dir}
mkdir test-installation
cd test-installation

# 初始化项目 {#init-project}
npm init -y

# 安装测试版本 {#install-beta}
npm install @ant-design/agentic-ui@alpha

# 验证版本 {#verify-version}
npm list @ant-design/agentic-ui
```

### 2. 功能测试 {#functional-testing}

创建测试文件 `test.js`：

```javascript
import React from 'react';
import { MarkdownEditor } from '@ant-design/agentic-ui';

function App() {
  return (
    <div>
      <h1>测试 Alpha 版本</h1>
      <MarkdownEditor
        defaultValue="# Hello World"
        onChange={(value) => console.log(value)}
      />
    </div>
  );
}

export default App;
```

### 3. 构建测试 {#build-testing}

```bash
# 测试构建 {#test-build}
npm run build

# 检查构建产物大小 {#check-bundle-size}
ls -la dist/

# 分析包大小 {#analyze-bundle-size}
npx bundle-analyzer dist/
```

### 4. 兼容性测试 {#compatibility-testing}

```bash
# 测试不同 React 版本 {#react}
npm install react@16.14.0 react-dom@16.14.0
npm test

npm install react@17.0.2 react-dom@17.0.2
npm test

npm install react@18.2.0 react-dom@18.2.0
npm test
```

## 🔄 回滚策略 {#rollback-strategy}

### 1. 撤销 npm 发布 {#npm-2}

```bash
# 撤销发布 (仅在发布后 72 小时内有效) {#unpublish-within-72h}324} {#unpublish-within-72h}
npm unpublish @ant-design/agentic-ui@1.27.0-alpha.1

# 废弃版本 (推荐方式) {#deprecate-version}327} {#deprecate-version}
npm deprecate @ant-design/agentic-ui@1.27.0-alpha.1 "This version has critical bugs, please upgrade"
```

### 2. 版本降级 {#version-downgrade}

```bash
# 发布修复版本 {#publish-hotfix}
npm version prerelease --preid=alpha  # 1.27.0-alpha.2
npm publish --tag alpha
```

### 3. 紧急热修复 {#emergency-hotfix}

```bash
# 1. 创建热修复分支 {#create-hotfix-branch}
git checkout v1.26.55
git checkout -b hotfix/v1.26.56

# 2. 修复问题 {#fix-the-issue}
# ...

# 3. 发布修复版本 {#publish-hotfix-2}
npm version patch  # 1.26.56
npm publish  # 正式版本

# 4. 合并回主分支 {#merge-back-to-main}
git checkout main
git merge hotfix/v1.26.56
```

## 📋 完整发布流程 {#full}

### 快速发布指南 {#quick-release-guide}

以下是完整的手动发布流程：

```bash
# 1. 确保代码最新且工作区干净 {#ensure-latest-clean}
git checkout main
git pull origin main
git status  # 确保没有未提交的更改

# 2. 运行质量检查 {#run-quality-checks}
pnpm lint        # 代码规范检查
pnpm tsc         # 类型检查
pnpm test        # 运行测试
pnpm build       # 构建项目

# 3. 更新版本号并发布 {#bump-and-publish}
npm version prerelease --preid=alpha  # 更新为 alpha 版本
npm publish --tag=alpha               # 发布到 npm

# 4. 推送到 Git {#git}
git push origin main --follow-tags
```

### 分步骤详细说明 {#notes-2}

#### 步骤 1: 环境准备 {#env-preparation}

```bash
# 检查 npm 登录状态 {#status-npm-2}
npm whoami

# 确保在正确的分支 {#ensure-correct-branch}
git branch --show-current

# 拉取最新代码 {#pull-latest-2}
git pull origin main
```

#### 步骤 2: 代码质量检查 {#code-quality-check-2}

```bash
# 代码规范检查 {#code-convention-check}
pnpm lint

# TypeScript 类型检查 {#types-typescript}
pnpm tsc

# 运行所有测试 {#run-all-tests-2}
pnpm test

# 构建项目 {#build-project-3}
pnpm build
```

#### 步骤 3: 版本更新 {#version-update}

```bash
# 根据需要选择版本类型 {#types-2}
npm version prerelease --preid=alpha   # Alpha 版本
npm version prerelease --preid=beta    # Beta 版本
npm version prerelease --preid=rc      # RC 版本
```

#### 步骤 4: 发布到 npm {#npm-3}

```bash
# 根据版本类型使用对应标签 {#types-3}
npm publish --tag=alpha    # Alpha 版本
npm publish --tag=beta     # Beta 版本
npm publish --tag=next     # RC 版本
```

#### 步骤 5: 推送到 Git {#git-2}

```bash
# 推送代码和标签 {#push-code-and-tags-3}
git push origin main --follow-tags
```

### 验证发布 {#verify-release}

```bash
# 检查发布是否成功 {#check-release-success}
npm view @ant-design/agentic-ui dist-tags

# 安装测试 {#install-test-2}
npm install @ant-design/agentic-ui@alpha
```

## 📊 发布监控### 1. npm 下载统计 {#npm-4}

```bash
# 查看下载统计 {#download-stats}
npm view @ant-design/agentic-ui

# 查看特定版本信息 {#version-info}
npm view @ant-design/agentic-ui@1.27.0-alpha.1

# 查看所有版本 {#all-versions}
npm view @ant-design/agentic-ui versions --json
```

### 2. 错误监控 {#error-monitoring}

配置错误监控服务，收集用户反馈：

```javascript
// 在组件中添加错误边界
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  // 发送错误报告到监控服务
  reportError(error, {
    version: process.env.npm_package_version,
    userAgent: navigator.userAgent,
  });

  return (
    <div role="alert">
      <h2>出现了一些问题:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}
```

## 📚 最佳实践 {#best-practices}

### 1. 发布频率 {#release-frequency}

- **Alpha**: 每周发布，包含最新功能
- **Beta**: 双周发布，功能相对稳定
- **RC**: 月度发布，准备正式发布
- **正式版**: 按需发布，重要功能或修复

### 2. 测试策略 {#test-strategy}

- Alpha: 内部测试，自动化测试
- Beta: 社区测试，征集反馈
- RC: 生产环境测试，性能测试
- 正式版: 全面回归测试

### 3. 沟通策略 {#communication-strategy}

- 发布前：在社区公告测试版本
- 发布后：收集用户反馈
- 定期总结：测试版本使用情况

### 4. 风险控制 {#risk-control}

- 逐步推出：先小范围测试
- 监控指标：错误率、性能指标
- 快速响应：及时处理问题

## 🔧 故障排除 {#troubleshooting}

### 常见问题 {#faq}

#### 1. 发布权限问题 {#publish-permission-issues}

```bash
# 检查 npm 登录状态 {#status-npm-3}
npm whoami

# 重新登录 {#relogin}
npm logout
npm login

# 检查包权限 {#check-package-permissions}
npm access list packages
```

#### 2. 版本冲突 {#version-conflict}

```bash
# 检查远程版本 {#check-remote-version}
npm view @ant-design/agentic-ui versions

# 强制更新版本 {#force-version-update}
npm version patch --force
```

#### 3. 构建失败 {#build-failure}

```bash
# 清理缓存 {#clean-cache}
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 重新构建 {#rebuild}
pnpm build
```

#### 4. 测试失败 {#test-failure}

```bash
# 更新测试快照 {#update-snapshots}
pnpm test -- --update-snapshots

# 运行特定测试 {#run-specific-test}
pnpm test -- --testNamePattern="specific test"
```

## 📞 获得帮助 {#getting-help}

如果在发布过程中遇到问题：

1. 查看 [npm 文档](https://docs.npmjs.com/)
2. 检查 [GitHub Actions 日志](https://github.com/ant-design/agentic-ui/actions)
3. 联系项目维护者
4. 在 [Issues](https://github.com/ant-design/agentic-ui/issues) 中报告问题

---

通过规范的测试版本发布流程，我们可以确保 agentic-ui 的质量和稳定性。🚀
