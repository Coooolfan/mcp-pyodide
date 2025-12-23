import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const EXECUTE_PYTHON_TOOL: Tool = {
  name: "pyodide_execute",
  description: `Executes Python code using Pyodide with output capture.

**File System & Networking:**
- The mount point is restricted and may be empty.
- Input: Use network libraries to download user-provided files.
- Output: Users cannot directly access local files; use the \`upload-oss\` tool to persist files to OSS.

**Pyodide Coding Guidelines:**
1. Imports: Submodules are not auto-imported. You must use \`from pyodide.http import pyfetch\` explicitly.
2. Async Execution: Top-level \`await\` is supported and preferred.
eg.
\`\`\`python
from pyodide.http import pyfetch  
response = await pyfetch("https://httpbin.org/get")  
data = await response.string()  
data
\`\`\`

**Example usage:**
1. download user provided files from OSS
\`\`\`python
import os
from pyodide.http import pyfetch
file_path = "/mnt/data/data.json" # fetch from pyodide_get-mount-points
response = await pyfetch("https://httpbin.org/get")
content = await response.bytes() 
with open(file_path, "wb") as f:
    f.write(content)
\`\`\`
2. do something with the file and create a new file
3. use pyodide_upload-file-oss to upload the new file to OSS
4. return the signed URL to user as image or download link in markdown format
`,

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
  description:
    "Upload a file to OSS, return a signed URL. user can use this signed URL to download the file directly. The file must be in the mounted directory.",
  inputSchema: {
    type: "object",
    properties: {
      mountName: {
        type: "string",
        description: "Name of the mount point, fetch from pyodide_get-mount-points, e.g., 'data'",
      },
      filePath: {
        type: "string",
        description: "Path of the file, relative to the mount point, e.g., 'image.png'",
      },
    },
    required: ["mountName", "filePath"],
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
