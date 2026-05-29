# Error Handling & Extending the Language

Reference guide for all errors produced by the interpreter and how to extend the language.

## Error Handling Summary

All errors are thrown as `Error` objects and propagate to the CLI handler, which prints them to stderr.

| Error Scenario | Error Message | Source |
|----------------|---------------|--------|
| File not found | `Error: File "..." not found.` | cli.js |
| Wrong file extension | `Error: File must have a ".txts" extension.` | cli.js |
| Function not found | `Error: Function "lib.fn" not found in project root ...` | executor.js |
| CALL without IMPORT | `Error: Cannot CALL ... library "..." is not imported in this file. Use IMPORT ... first.` | executor.js |
| Write to unimported library | `Error: Cannot assign to "lib.x": library "lib" is not imported in this file. Use IMPORT lib first.` | executor.js |
| Read from unimported library | `Error: Cannot read "lib.x": library "lib" is not imported in this file. Use IMPORT lib first.` | executor.js |
| Write to txts.* (not OUTPUT) | `Error: Cannot assign to "txts.NAME": only "txts.OUTPUT" is writable in the internal "txts" library.` | executor.js |
| Recursion limit exceeded | `Error: Recursion limit of 50 reached when calling lib.fn.` | executor.js |
| Variable not found | `Error: Variable "lib.x" does not exist in library "lib".` | executor.js |

## Extending the Language

To add new features to txts, here are the modules you'd typically modify:

| Change | Modules to Modify |
|--------|-------------------|
| Add a new command type | `parser.js` (new parse function), `executor.js` (new execute function), `cli.js` (update help text) |
| Add a new built-in variable | `builtins.js` (add to `createBuiltinVariables`) |
| Change library resolution | `resolver.js` (modify `resolveLibraryPath`) |
| Add new extension command | `extensions/txtspm/operations.js` (new handler), `extensions/txtspm/index.js` (add dispatch case) |
| Change file isolation behavior | `executor.js` (modify `executeFile`, `executeImport`, `executeCall`) |
| Change variable semantics | `executor.js` (modify `executeAdd`) |
| Add error handling | Add throw statements in the relevant module; errors are caught by the CLI handler |

## Error Propagation

Errors follow a simple propagation path:

```
executor.js → (throw Error) → cli.js (catch) → stderr
```

The CLI handler wraps execution in a try-catch. Errors are printed to stderr with `console.error`. Non-error output goes to stdout.

---

<div class="pager">
  <a href="#dev-repl">&laquo; REPL</a>
  <span></span>
</div>
