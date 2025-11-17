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

## CLI Reasoning Trace Example

Below is a **real output** from the Orchestrator Engine’s reasoning trace renderer.  
It shows how reasoning steps are visualized directly in the terminal.

![CLI Reasoning Trace Example](./docs/images/trace-example.png)

---

## Structure

```
/src
  /config       → configuration and profile management
  /pipeline     → normalization, analysis, synthesis
  /reasoning    → reasoning providers (OpenAI, mock)
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
