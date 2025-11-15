# Orchestrator Engine (OE)

An open-source, config-driven AI orchestration framework designed to make multi-step reasoning, automation, and analysis reusable across any domain.

## Overview

The Orchestrator Engine (OE) separates orchestration logic from configuration, allowing both public (OSS) and private (external) profiles to drive the same orchestration pipeline.

Built with TypeScript, AWS-ready architecture, and a config-as-control philosophy.

## Features

- Config-driven orchestration pipeline
- Public and private profile support
- Modular TypeScript architecture
- Compatible with AWS Lambda or standalone usage
- ESM-native (NodeNext) build system
- Designed for frontend integration (Next.js SSG compatible)

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

## Structure

```
/src
  /config       → configuration and profile management
  /pipeline     → normalization, analysis, synthesis
  /utils        → logging and shared utilities
  index.ts      → core orchestration entry point
```

## Philosophy

OE is built on the idea of config-as-control — everything about the orchestration process (AI reasoning, domain focus, prompts, UI labels) is controlled through configuration, not hard-coded logic.

This allows:
- Reusable orchestration across any domain
- Private configurations for confidential projects
- Public OSS configurations for open demos

## Example Usage

```ts
import { runOrchestration } from "./src/index.js";

const input = "Analyze the performance of a multi-cloud AI pipeline.";
runOrchestration(input, "ai").then(console.log);
```

## License

MIT License

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and commit conventions.
