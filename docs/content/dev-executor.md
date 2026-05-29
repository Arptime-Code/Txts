# Executor (general/executor.js) — The Core Engine

The executor is the heart of the interpreter. It manages the execution context, runs commands, and handles all variable resolution.

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `RECURSION_LIMIT` | 50 | Maximum CALL nesting depth to prevent infinite recursion |
| `OUTPUT_TARGET_STDOUT` | `'stdout'` | Sentinel value for console output (vs. file output) |

## Context Object

```
{
  variables:      { ... },        // All variables, keyed by library then by name
  projectRoot:    '/path/to/project',
  recursionDepth: 0,              // Current CALL depth
  fileImports:    {}              // Libraries imported by the current file
}
```

## Execution Flow

### runProgram(filePath, outputTarget)

The top-level entry point for program execution:

1. Finds the project root via `resolver.findProjectRoot`
2. Creates a fresh context with builtin variables (from `builtins.createBuiltinVariables`)
3. Calls `executeFile` on the target file
4. Reads `txts.OUTPUT` and writes it to stdout or a file

### executeFile(filePath, context)

Executes a single `.txts` file within the given context:

1. If the file doesn't exist, returns silently
2. **Resets** `context.fileImports = {}` — this provides file-level isolation
3. Reads the file content and parses it into commands
4. Executes all commands in order via `executeCommands`

> **File isolation:** Each file gets its own `fileImports` state. Libraries imported in one file aren't automatically available in another — each file must `IMPORT` what it needs.

### executeCommands(commands, context)

Iterates over an array of command objects and dispatches each by its `type`:

- `'import'` → `executeImport`
- `'call'` → `executeCall`
- `'add'` → `executeAdd`
- `'replace'` → `executeReplace`

## Execute Import

```
function executeImport(command, context) {
  var libraryName = command.library;
  context.fileImports[libraryName] = true;
  if (libraryName === builtins.TXTS_LIBRARY_NAME) {
    return;
  }
}
```

`IMPORT` is intentionally minimal. It just marks the library as imported in the current file's `fileImports`. No namespace is created, no files are executed. The `txts` library is handled as a no-op since it's always available.

## Execute Call

Executes a specific function file:

1. Checks that the library is in `fileImports` (throws if not imported)
2. Checks recursion depth against `RECURSION_LIMIT` (throws if exceeded)
3. Resolves the function path via `resolver.resolveFunctionPath`
4. **Saves** `fileImports`, increments recursion depth
5. Executes the function file
6. **Restores** `fileImports`, decrements recursion depth

> **File isolation:** CALL saves/restores `fileImports` so the called function operates in its own import context. However, `context.variables` is shared globally — any variable a function sets is visible to the caller.

## Execute ADD

Handles the `ADD` command — appends a chain item to a variable's chain:

1. **Guard:** If target is `txts.*` and not `txts.OUTPUT` → throw (txts is read-only)
2. **Guard:** If target library not in `fileImports` → throw
3. **Guard:** If source is a reference and its library not in `fileImports` → throw
4. **Lazy namespace:** Creates `context.variables[target.library]` if it doesn't exist yet
5. **Lazy chain:** If target variable doesn't exist yet, creates an empty chain array. If it's a plain string, converts to a chain array with that string as the first item.
6. **Add chain item:**
   - If source is `txts.CLEAR` → reset chain to `''` (empty string)
   - If source is a **string literal** → append `{type: 'value', value: "..."}` to the chain
   - If source is a **variable reference** → append `{type: 'ref', library: '...', name: '...'}` to the chain (lazy — resolved at read time)

> **Append vs Overwrite:** Multiple `ADD` calls to the same variable accumulate. Use `txts.CLEAR` to reset a variable to empty.

## Execute REPLACE

Handles the `REPLACE` command with three forms:

1. **No source** (`REPLACE lib.var`) — Resolves the entire chain right now and stores the result as a plain string (freeze)
2. **String source** (`REPLACE lib.var "text"`) — Replaces all ref items in the chain with the literal string; leaves string value items untouched
3. **Reference source** (`REPLACE lib.var lib.ref`) — Finds ref items pointing to `lib.ref` and replaces them with the resolved value of `lib.ref` at this moment; leaves other items untouched

> **Eager vs Lazy:** `ADD` stores lazy references — resolved at read time. `REPLACE` resolves eagerly — values are captured at this moment.

## Value Resolution

### resolveValue(context, source)

| Source Type | Behavior |
|-------------|----------|
| String | Returns the string value directly |
| Reference | Calls `resolveReference` to look up the variable |

### resolveReference(context, library, name)

1. Creates `context.variables[library]` if it doesn't exist (lazy namespace)
2. Checks that `libVars[name] !== undefined` (throws if not found)
3. Returns the value (`''` is a valid value, distinct from `undefined`)

---

<div class="pager">
  <a href="#dev-builtins">&laquo; Builtins</a>
  <a href="#dev-txtspm" class="next">Next: txtspm Extension &raquo;</a>
</div>
