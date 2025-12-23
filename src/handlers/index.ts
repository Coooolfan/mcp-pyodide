import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { type } from "arktype";

import * as tools from "../tools/index.js";
import { ResourceClient } from "../resources/index.js";
import { PyodideManager } from "../lib/pyodide/pyodide-manager.js";
import { formatCallToolError } from "../formatters/index.js";
import { runSSEServer } from "../sse.js";
import { runStreamableServer } from "../streamable.js";

const TOOLS: Tool[] = [
  tools.EXECUTE_PYTHON_TOOL,
  tools.INSTALL_PYTHON_PACKAGES_TOOL,
  tools.GET_MOUNT_POINTS_TOOL,
  tools.READ_MEDIA_TOOL,
];

const isExecutePythonArgs = type({
  code: "string",
  "timeout?": "number",
});

const isInstallPythonPackagesArgs = type({
  package: "string",
});

const isListMountedDirectoryArgs = type({
  mountName: "string",
});

const isReadImageArgs = type({
  mountName: "string",
  imagePath: "string",
});

function setupServerHandlers(server: Server) {
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const pyodideManager = PyodideManager.getInstance();
    const resourceClient = new ResourceClient(pyodideManager);
    const resources = await resourceClient.listResources();
    return { resources };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const pyodideManager = PyodideManager.getInstance();
    const resourceClient = new ResourceClient(pyodideManager);
    const resource = await resourceClient.readResource(request.params.uri);
    return { contents: [resource] };
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;
      const userId = (request.params._meta?.headers as Record<string, any>)?.["user-id"];

      console.log("call tool: \n", name, "\nargs: \n", args, "\nuserId: \n", userId);

      if (userId == null || !/^\d+$/.test(userId)) {
        throw new Error("Invalid or missing user ID");
      }

      if (!args) {
        throw new Error("No arguments provided");
      }

      const pyodideManager = PyodideManager.getInstance();

      switch (name) {
        case "pyodide_execute": {
          const executePythonArgs = isExecutePythonArgs(args);
          if (executePythonArgs instanceof type.errors) {
            throw executePythonArgs;
          }
          const { code, timeout = 5000 } = executePythonArgs;
          return await pyodideManager.executePython(code, timeout);
        }
        case "pyodide_install-packages": {
          const installPythonPackagesArgs = isInstallPythonPackagesArgs(args);
          if (installPythonPackagesArgs instanceof type.errors) {
            throw installPythonPackagesArgs;
          }
          const { package: packageName } = installPythonPackagesArgs;
          return await pyodideManager.installPackage(packageName);
        }
        case "pyodide_get-mount-points": {
          return await pyodideManager.getMountPoints();
        }
        case "pyodide_read-media": {
          const readImageArgs = isReadImageArgs(args);
          if (readImageArgs instanceof type.errors) {
            throw readImageArgs;
          }
          const { mountName, imagePath } = readImageArgs;
          return await pyodideManager.readImage(mountName, imagePath);
        }
        default: {
          return formatCallToolError(`Unknown tool: ${name}`);
        }
      }
    } catch (error) {
      return formatCallToolError(error);
    }
  });
}

function createServer(): Server {
  const server = new Server(
    {
      name: "mcp-pyodide",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  setupServerHandlers(server);
  return server;
}

const server = createServer();

async function initializePyodide() {
  const pyodideManager = PyodideManager.getInstance();
  const cacheDir = process.env.PYODIDE_CACHE_DIR || "./cache";
  const dataDir = process.env.PYODIDE_DATA_DIR || "./data";

  if (!(await pyodideManager.initialize(cacheDir))) {
    throw new Error("Failed to initialize Pyodide");
  }

  await pyodideManager.mountDirectory("data", dataDir);
}

async function runServer() {
  const args = process.argv.slice(2);
  const useSSE = args.includes("--sse");
  const useStreamable = args.includes("--streamable");

  await initializePyodide();

  if (useStreamable) {
    await runStreamableServer(createServer);
  } else if (useSSE) {
    await runSSEServer(server);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Pyodide MCP Server running on stdio");
  }
}

export { createServer, server, runServer };
