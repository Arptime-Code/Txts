# Developer Documentation

This section describes the internal architecture of the txts interpreter. It's intended for developers who want to understand, modify, or extend the language.

## Architecture Overview

The txts interpreter is a Node.js application organized into a pipeline of stages:

```
.txts file → [CLI] → [Parser] → [Resolver] → [Executor] → Output
```

### Module Overview

| Module | File | Documentation |
|--------|------|---------------|
| Entry Point & CLI Handler | `general/index.js`, `general/cli.js` | [CLI & Entry Point →](#dev-cli) |
| Helpers / Utilities | `general/helpers.js` | [Helpers →](#dev-helpers) |
| Parser | `general/parser.js` | [Parser →](#dev-parser) |
| Resolver | `general/resolver.js` | [Resolver →](#dev-resolver) |
| Builtins | `general/builtins.js` | [Builtins →](#dev-builtins) |
| Executor (Core Engine) | `general/executor.js` | [Executor →](#dev-executor) |
| txtspm Package Manager | `extensions/txtspm/` | [txtspm Extension →](#dev-txtspm) |
| REPL | `extensions/repl.js` | [REPL →](#dev-repl) |
| Error Handling Reference | — | [Error Handling →](#dev-errors) |

## Data Flow Diagram

```
// Program execution flow:
//
// runProgram(path)
//   |
//   +-- findProjectRoot()  → projectRoot
//   +-- createContext()     → variables (including builtins)
//   +-- executeFile(path, context)
//        |
//        +-- parseFile()    → commands[]
//        +-- executeCommands(commands, context)
//             |
//             +-- IMPORT → executeImport
//             |     +-- set fileImports[library] = true
//             |
//             +-- CALL  → executeCall
//             |     +-- resolveFunctionPath()
//             |     +-- executeFile() (file isolation)
//             |     +-- save/restore fileImports
//             |
//             +-- ADD → executeAdd
//             |
//             +-- REPLACE → executeReplace
//                   +-- resolveValue()
//                   |     +-- string → return value
//                   |     +-- reference → resolveReference()
//                   |     +-- txts.CLEAR → set '' (overwrite)
//                   |     +-- otherwise → append to chain
//             |
//             +-- REPLACE → executeReplace
//                   +-- no source → freeze chain to string
//                   +-- string source → replace all refs with string
//                   +-- ref source → replace matching refs with value
//
// Context state:
// - fileImports: cleared at executeFile start, restored after CALL
// - variables: shared globally, persists across all files
// - recursionDepth: incremented/decremented around CALL
```

## Key Design Principles

- **File isolation:** Each file gets its own `fileImports` context. Libraries must be imported per-file.
- **Shared variables:** All variables live in a global `context.variables` object shared across files.
- **Lazy namespaces:** Library namespaces are created only when a variable is first assigned or read.
- **Passive IMPORT:** `IMPORT` only marks a library as available. No files are executed until `CALL`.
- **Append + REPLACE semantics:** `ADD` appends lazy items to a chain. `REPLACE` resolves or replaces items in the chain eagerly. Use `txts.CLEAR` to reset.
