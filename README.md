# Orchestrator Engine (OE)

An open-source, **config-driven AI orchestration framework** for reusable multi-step reasoning, automation, and analysis — across any domain.

---

## Overview

The **Orchestrator Engine (OE)** separates orchestration logic from configuration.  
Both public (open-source) and private (external) profiles can drive the same orchestration pipeline, ensuring reusability, security, and clear separation of concerns.

Built with **TypeScript**, **AWS-ready architecture**, and a **config-as-control** philosophy.

---

## Features

- **Config-driven orchestration pipeline**
- **Public & private profile support**
- **Real & mock AI reasoning providers**
- **Structured reasoning trace visualization (CLI & JSON)**
- **Modular TypeScript architecture**
- **AWS Lambda compatible, standalone ready**
- **ESM-native (NodeNext) build system**
- **Frontend-ready output (Next.js SSG compatible)**
- **MCP stdio server for external tool integration**

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/orchestrator-engine.git
cd orchestrator-engine
npm install
```

### 2. Run locally
```bash
npm run dev
```

### 3. Build and start
```bash
npm run build
npm start
```

### 4. Run the CLI demo
```bash
npm run demo
```

---

## MCP Stdio Server

The **MCP stdio server** lets OE act as a lightweight backend for clients such as  
Claude Desktop, MCP Inspector, or any JSON-RPC 2.0-compatible interface.

It exposes all built-in OE tools (`fetchUrl`, `awsListObjects`, `awsGetObject`) through standard MCP calls.

### Start the MCP server
```bash
npm run build
node dist/mcp/stdioServer.js
```

### Example requests

#### Initialize
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26"}}' | node dist/mcp/stdioServer.js
```

#### List available tools
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node dist/mcp/stdioServer.js
```

#### Call a tool
```bash
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"fetchUrl","arguments":{"url":"https://example.com"}}}' | node dist/mcp/stdioServer.js
```

Responses are valid JSON-RPC 2.0 objects printed to **stdout**.  
Structured MCP events (`mcp.event`, `mcp.result`, `mcp.error`) are logged to **stderr**.

### Default capabilities

| Setting | Description | Default |
|----------|--------------|----------|
| `cliOnly` | Allows only read-safe tools | `true` |
| `awsApi` | Enables AWS read-only operations | `true` |
| `requiresHumanApproval` | Indicates human oversight required | `true` |

---

## Structure

```
/src
  /config       → configuration and profile management
  /pipeline     → normalization, analysis, synthesis
  /reasoning    → reasoning providers (OpenAI, mock)
  /mcp          → MCP call handler and stdio server
  /tools        → built-in tools (fetchUrl, awsListObjects, awsGetObject)
  /utils        → logging, formatting, rendering
  index.ts      → core orchestration entry point
```

---

## Philosophy

OE is built on the idea of **config-as-control** — every aspect of orchestration  
(AI reasoning, domain focus, prompts, UI labels) is controlled through configuration,  
not hard-coded logic.

This enables:

- Reusable orchestration across any domain  
- Secure private configurations for enterprise or confidential projects  
- Public OSS configurations for open demos and experimentation  

---

## Example Usage

```ts
import { runOrchestration } from "./src/index.js";

const input = "Analyze the performance of a multi-cloud AI pipeline.";
runOrchestration(input, "ai").then(console.log);
```

---

## License

MIT License  

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and commit conventions.
