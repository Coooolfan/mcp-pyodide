import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import express, { Request } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

function getClientIp(req: Request): string {
  return (
    req.get("x-forwarded-for")?.split(",")[0] ||
    req.get("x-real-ip") ||
    req.ip ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

type TransportEntry = {
  transport: StreamableHTTPServerTransport;
  server: Server;
};

export async function runStreamableServer(createServer: () => Server) {
  const transports: Record<string, TransportEntry> = {};

  const app = express();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "DELETE"],
      allowedHeaders: ["Content-Type", "mcp-session-id", "last-event-id"],
      exposedHeaders: ["mcp-session-id"],
    }),
  );

  app.use(bodyParser.json());

  app.post("/mcp", async (req, res) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (sessionId) {
        const entry = transports[sessionId];
        if (!entry) {
          res.status(404).send("Invalid or missing session ID");
          return;
        }

        const body = req.body;
        const params = body?.params || {};
        params._meta = {
          ip: getClientIp(req),
          headers: req.headers,
        };

        const enrichedBody = {
          ...body,
          params,
        };

        await entry.transport.handleRequest(req, res, enrichedBody);
        return;
      }

      if (!isInitializeRequest(req.body)) {
        res.status(400).send("Bad Request: No valid session ID provided");
        return;
      }

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });

      const server = createServer();

      await server.connect(transport);

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          delete transports[sid];
        }
      };

      const body = req.body;
      const params = body?.params || {};
      params._meta = {
        ip: getClientIp(req),
        headers: req.headers,
      };

      const enrichedBody = {
        ...body,
        params,
      };

      await transport.handleRequest(req, res, enrichedBody);

      const sid = transport.sessionId;
      if (sid) {
        transports[sid] = { transport, server };
      }
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).send("Internal server error");
      }
      console.error("Error handling MCP request:", error);
    }
  });

  app.get("/mcp", async (req, res) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(404).send("Invalid or missing session ID");
        return;
      }

      await transports[sessionId].transport.handleRequest(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).send("Internal server error");
      }
      console.error("Error handling MCP request:", error);
    }
  });

  app.delete("/mcp", async (req, res) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(404).send("Invalid or missing session ID");
        return;
      }

      await transports[sessionId].transport.handleRequest(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).send("Internal server error");
      }
      console.error("Error handling MCP request:", error);
    }
  });

  app.use((req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  const port = Number(process.env.MCP_PORT || 3020);
  app.listen(port, () => {
    console.error(`pyodide MCP Server running on Streamable HTTP at http://localhost:${port}/mcp`);
  });
}
