[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/yonaka15-mcp-pyodide-badge.png)](https://mseep.ai/app/yonaka15-mcp-pyodide)

[English](README.en.md) | [中文](README.md) | [日本語](README.ja.md)

# mcp-pyodide

A Pyodide server implementation for the Model Context Protocol (MCP). This server enables Large Language Models (LLMs) to execute Python code through the MCP interface.

<a href="https://glama.ai/mcp/servers/pxls43joly">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/pxls43joly/badge" alt="mcp-pyodide MCP server" />
</a>

## Features

- Python code execution capability for LLMs using Pyodide
- MCP compliant server implementation
- Support for stdio, SSE, and Streamable HTTP transport modes
- Robust implementation written in TypeScript
- Available as a command-line tool

## Installation

```bash
git clone <repository-url>
cd mcp-pyodide
npm i
npm run build
```

## Usage

This project is **not published to the npm registry**. Please build and run it locally.

Start in stdio mode (default):

```bash
node build/index.js
```

Start in SSE mode:

```bash
node build/index.js --sse
```

Start in Streamable HTTP mode:

```bash
node build/index.js --streamable
```

### SSE Mode

When running in SSE mode, the server provides the following endpoints:

- SSE Connection: `http://localhost:3020/sse`
- Message Handler: `http://localhost:3020/messages`

Example client connection:

```typescript
const eventSource = new EventSource("http://localhost:3020/sse");
eventSource.onmessage = (event) => {
  console.log("Received:", JSON.parse(event.data));
};
```

### Streamable HTTP Mode

When running in Streamable HTTP mode, the server provides the following endpoint:

- MCP Endpoint: `http://localhost:3020/mcp`

This endpoint supports:

- `POST /mcp` for MCP requests (including initialization)
- `GET /mcp` for the notification stream (SSE) after initialization
- `DELETE /mcp` for session termination

## Project Structure

```
mcp-pyodide/
├── src/
│   ├── formatters/    # Data formatting handlers
│   ├── handlers/      # Request handlers
│   ├── lib/          # Library code
│   ├── tools/        # Utility tools
│   ├── utils/        # Utility functions
│   └── index.ts      # Main entry point
├── build/            # Build artifacts
├── pyodide-packages/ # Pyodide-related packages
└── package.json
```

## Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK (^1.25.1)
- `pyodide`: Python runtime environment (^0.29.0)
- `arktype`: Type validation library (^2.0.1)
- `express`: Web framework for SSE support
- `cors`: CORS middleware for SSE support

## Development

### Requirements

- Node.js 18 or higher
- npm 9 or higher

### Setup

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Build
npm run build
```

### Scripts

- `npm run build`: Compile TypeScript and set execution permissions
- `npm start`: Run server in stdio mode
- `npm run start:sse`: Run server in SSE mode

## Environment Variables

- `PYODIDE_CACHE_DIR`: Directory for Pyodide cache (default: "./cache")
- `PYODIDE_DATA_DIR`: Directory for mounted data (default: "./data")
- `MCP_PORT`: Port for HTTP server (SSE / Streamable HTTP) (default: 3020)
- `PORT`: Alias for `MCP_PORT` (default: 3020)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Important Notes

- This project is under development, and the API may change
- Thoroughly test before using in production
- Exercise caution when executing untrusted code for security reasons
- When using SSE mode, ensure proper CORS configuration if needed

## Support

Please use the Issue tracker for problems and questions.
