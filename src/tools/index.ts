import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const EXECUTE_PYTHON_TOOL: Tool = {
  name: "pyodide_execute",
  description:
    "Execute Python code using Pyodide with output capture. When generating images, they will be automatically saved to the output directory instead of being displayed. Images can be accessed from the saved file paths that will be included in the output.\n\nNetworking notes (Pyodide):\n- `import pyodide` does not auto-import submodules; use `from pyodide.http import pyfetch` (or `import pyodide.http`) before calling HTTP helpers.\n- Prefer running async code in an async context: top-level `await` works when executed via `runPythonAsync` (e.g., `response = await pyfetch(url)`).\n- Avoid `asyncio.run(...)` / `loop.run_until_complete(...)` in this environment; it may fail with `WebAssembly stack switching not supported in this JavaScript runtime`. Use `await your_async_func()` instead.",
  inputSchema: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: "Python code to execute",
      },
      timeout: {
        type: "number",
        description: "Execution timeout in milliseconds (default: 5000)",
      },
    },
    required: ["code"],
  },
};

export const INSTALL_PYTHON_PACKAGES_TOOL: Tool = {
  name: "pyodide_install-packages",
  description:
    "Install Python packages using Pyodide. Multiple packages can be specified using space-separated format.",
  inputSchema: {
    type: "object",
    properties: {
      package: {
        type: "string",
        description:
          "Python package(s) to install. For multiple packages, use space-separated format (e.g., 'numpy matplotlib pandas').",
      },
    },
    required: ["package"],
  },
};

export const GET_MOUNT_POINTS_TOOL: Tool = {
  name: "pyodide_get-mount-points",
  description: "List mounted directories",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

export const UPLOAD_FILE_OSS_TOOL: Tool = {
  name: "pyodide_upload-file-oss",
  description: "Upload a file to OSS, return a URL. user can use this URL to download the file.",
  inputSchema: {
    type: "object",
    properties: {
      mountName: {
        type: "string",
        description: "Name of the mount point, fetch from pyodide_get-mount-points, e.g., 'mnt'",
      },
      imagePath: {
        type: "string",
        description: "Path of the image file, relative to the mount point, e.g., 'image.png'",
      },
    },
    required: ["mountName", "imagePath"],
  },
};

export const READ_MEDIA_TOOL: Tool = {
  name: "pyodide_read-media",
  description: "Read an image or audio from a mounted directory",
  inputSchema: {
    type: "object",
    properties: {
      mountName: {
        type: "string",
        description: "Name of the mount point, fetch from pyodide_get-mount-points, e.g., 'mnt'",
      },
      imagePath: {
        type: "string",
        description: "Path of the image file, relative to the mount point, e.g., 'image.png'",
      },
    },
    required: ["mountName", "imagePath"],
  },
};
