# @spottoai/types-package

Shared TypeScript interfaces for SpottoAI

## 开发工具

本项目配置了以下开发工具：

### ESLint
代码质量检查工具，确保代码符合规范。

```bash
# 检查代码
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

### Prettier
代码格式化工具，确保代码风格一致。

```bash
# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

### Husky
Git hooks 工具，在提交前自动运行检查。

- **pre-commit**: 在提交前自动运行 `npm run lint` 和 `npm run build`

### 可用的脚本

```bash
# 构建项目
npm run build

# 开发模式（监听文件变化）
npm run dev

# 清理构建文件
npm run clean

# 代码检查
npm run lint

# 代码检查并自动修复
npm run lint:fix

# 代码格式化
npm run format

# 检查代码格式
npm run format:check
```

## 安装

```bash
npm install
```

## 构建

```bash
npm run build
```

构建后的文件将输出到 `dist/` 目录。