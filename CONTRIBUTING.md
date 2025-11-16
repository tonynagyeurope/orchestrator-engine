# Contributing to Orchestrator Engine (OE)

Thanks for your interest in contributing to Orchestrator Engine (OE) —
an open-source, config-driven AI orchestration framework built with TypeScript and AWS-ready design principles.

## Project Philosophy

OE follows a config-as-control philosophy — meaning behavior, logic, and output can all be defined by JSON configuration rather than hard-coded rules.

The goal is to make orchestration transparent, extensible, and developer-friendly, with a focus on:

- Clean modular architecture
- OSS-level code readability
- Secure separation of public and private profiles
- Simple deployment and reusability

## Local Development

### Prerequisites

- Node.js 22.x or higher
- npm 10+

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

### Build and run

```bash
npm run build
npm start
```

## Codebase Structure

```
/src
  /config       → base configuration and profile loader
  /pipeline     → core orchestration steps (normalize → analyze → synthesize)
  /utils        → shared utilities (logger, validation, etc.)
  index.ts      → main orchestration entry
```

## Commit Convention

We follow the Conventional Commits style:

| Type      | Purpose                              |
| --------- | ------------------------------------ |
| feat:     | new feature                          |
| fix:      | bug fix                              |
| docs:     | documentation only                   |
| refactor: | structure or readability improvement |
| test:     | tests added or updated               |
| chore:    | maintenance, deps, build updates     |

### Examples

```
feat(config): add unified profile loader for public/private modes
docs(readme): clarify ESM build setup
refactor(core): simplify orchestration pipeline flow
```

## Testing

For now, a simple placeholder script exists:

```bash
npm test
```

Once test coverage expands, unit tests will be written using Vitest or Jest under /tests.

## Roadmap

| Day | Focus                       | Outcome                                  |
| --- | --------------------------- | ---------------------------------------- |
| 1   | Architecture + repo setup   | Base skeleton, config, pipeline          |
| 2   | Core orchestration pipeline | Input normalization, analysis, synthesis |
| 3   | Frontend SSG setup          | Basic UI + static export                 |
| 4   | Profile system integration  | Public & private config loading          |
| 5   | AWS deploy setup            | Lambda handler + serverless config       |
| 6   | Testing + code polish       | Basic test coverage                      |
| 7   | Docs + visuals              | OSS README, screenshots, badges          |

## Developer Notes

- All comments and code are in English only
- No icons, emojis, or non-ASCII content in source files
- Keep all commits atomic and descriptive
- Respect the OSS scope — no company-specific data is stored in the repo

## Join the Project

If you'd like to contribute improvements, refactors, or new orchestration features:

1. Fork the repository
2. Create a new branch (feat/your-feature-name)
3. Open a PR with a clear description and rationale

Happy Orchestrating!
