[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/yonaka15-mcp-pyodide-badge.png)](https://mseep.ai/app/yonaka15-mcp-pyodide)

[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md)

# mcp-pyodide

这是一个基于 Pyodide 的 Model Context Protocol (MCP) 服务器实现。该服务器使大语言模型（LLM）可以通过 MCP 接口执行 Python 代码。

<a href="https://glama.ai/mcp/servers/pxls43joly">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/pxls43joly/badge" alt="mcp-pyodide MCP server" />
</a>

## 特性

- 基于 Pyodide 的 Python 代码执行能力
- 符合 MCP 规范的服务器实现
- 支持 stdio、SSE 和 Streamable HTTP 三种传输模式
- 使用 TypeScript 编写
- 可作为命令行工具使用

## 安装

```bash
git clone <repository-url>
cd mcp-pyodide
npm i
npm run build
```

## 使用

本项目目前**未发布到 npm 仓库**，请通过本地构建的方式运行。

以 stdio 模式启动（默认）：

```bash
node build/index.js
```

以 SSE 模式启动：

```bash
node build/index.js --sse
```

以 Streamable HTTP 模式启动：

```bash
node build/index.js --streamable
```

### SSE 模式

当以 SSE 模式运行时，服务器提供以下端点：

- SSE 连接：`http://localhost:3020/sse`
- 消息处理：`http://localhost:3020/messages`

示例客户端连接：

```typescript
const eventSource = new EventSource("http://localhost:3020/sse");
eventSource.onmessage = (event) => {
  console.log("Received:", JSON.parse(event.data));
};
```

### Streamable HTTP 模式

当以 Streamable HTTP 模式运行时，服务器提供以下端点：

- MCP 端点：`http://localhost:3020/mcp`

该端点支持：

- `POST /mcp` 发送 MCP 请求（包含初始化请求）
- `GET /mcp` 在初始化后建立通知流（SSE）
- `DELETE /mcp` 终止会话

## 项目结构

```
mcp-pyodide/
├── src/
│   ├── formatters/    # 数据格式化
│   ├── handlers/      # 请求处理
│   ├── lib/          # 核心库代码
│   ├── tools/        # 工具实现
│   ├── utils/        # 工具函数
│   └── index.ts      # 主入口
├── build/            # 构建产物
├── pyodide-packages/ # Pyodide 相关包
└── package.json
```

## 依赖

- `@modelcontextprotocol/sdk`: MCP SDK (^1.25.1)
- `pyodide`: Python 运行时环境 (^0.29.0)
- `arktype`: 类型校验库 (^2.0.1)
- `express`: Web 框架（用于 SSE / Streamable HTTP）
- `cors`: CORS 中间件

## 开发

### 环境要求

- Node.js 18 或更高版本
- npm 9 或更高版本

### 代码风格

本项目使用 [Prettier](https://prettier.io/) 进行统一格式化：

```bash
npm run format        # 自动修复格式
npm run format:check  # 仅检查不修改
```

### 初始化

```bash
# 克隆仓库
git clone <repository-url>

# 安装依赖
npm install

# 构建
npm run build
```

### Scripts

- `npm run build`: 编译 TypeScript 并设置可执行权限
- `npm start`: 以 stdio 模式运行
- `npm run start:sse`: 以 SSE 模式运行

## 环境变量

- `PYODIDE_CACHE_DIR`: Pyodide 缓存目录（默认："./cache"）
- `PYODIDE_DATA_DIR`: 挂载的数据目录（默认："./data"）
- `MCP_PORT`: HTTP 服务端口（SSE / Streamable HTTP）（默认：3020）
- `PORT`: `MCP_PORT` 的别名（默认：3020）

## 许可证

MIT

## 贡献

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交变更（`git commit -am 'Add some amazing feature'`）
4. 推送到远端分支（`git push origin feature/amazing-feature`）
5. 创建 Pull Request

## 注意事项

- 本项目仍在开发中，API 可能会变化
- 在生产环境使用前请充分测试
- 出于安全原因，请谨慎执行不可信代码
- 使用 SSE 模式时，如有需要请确保正确配置 CORS

## 支持

如有问题或疑问，请使用 Issue tracker。
