# CLI & Entry Point

This page covers the interpreter's entry point and CLI handler — how a `.txts` file gets from the command line into the execution pipeline.

## Entry Point (general/index.js)

`general/index.js` is the application entry. It takes CLI arguments and passes them to the CLI handler:

```
var cli = require('./cli');
var args = process.argv.slice(2);
cli.run(args);
```

## CLI Handler (general/cli.js)

The CLI handler parses command-line arguments and dispatches to the correct handler.

### Key Functions

| Function | Description |
|----------|-------------|
| `getVersion()` | Reads and returns the version from `package.json` |
| `run(args)` | Main dispatch. Checks flags first, then routes to `handleRun` or `handleExtension` |
| `handleRun(args)` | Validates file path and extension, calls `executor.runProgram` |
| `handleExtension(args)` | Handles extension install and execution |
| `printHelp()` | Prints usage information including version, flags, and extension list |

### String Mode & the `--raw` Flag

By default, txts interprets escape sequences in string literals (`\n` → newline, `\t` → tab, etc.) using JSON-style parsing. This is called **parsed mode**. To disable escape sequence interpretation, pass `--raw`:

```
txts file.txts              # parsed mode (default) — \n becomes newline
txts --raw file.txts        # raw mode — \n stays as \\n
txts --raw repl             # REPL in raw mode
```

The `--raw` flag can appear anywhere in the argument list, and works for both file execution and REPL mode. It sets a global string mode on the `helpers` module via `setStringMode()`.

### Dispatch Logic

The `run(args)` function checks for `--raw` first, then checks built-in flags, then dispatches:

```
if (args.length === 0) {
  printHelp();
  return;
}

// --raw can appear anywhere
var rawIndex = args.indexOf('--raw');
if (rawIndex !== -1) {
  helpers.setStringMode('raw');
  args.splice(rawIndex, 1);
}

if (firstArg === '--help' || firstArg === '-h') {
  printHelp();
  return;
}

if (firstArg === '--version' || firstArg === '-v') {
  console.log('txts v' + getVersion());
  return;
}

if (firstArg === 'extension') {
  handleExtension(args.slice(1));
  return;
}

handleRun(args);
```

### File Validation

`handleRun` validates the input before executing:

- Checks that a file path was provided (prints help if not)
- Checks that the file has a `.txts` extension
- Checks that the file exists on disk
- Determines output target: stdout (no second arg) or a file (second arg provided)
- Calls `executor.runProgram(filePath, outputTarget)`

### Extension Management

Extensions are stored in `~/.txts/extensions/extensions.json`. Each extension has a name, description, and path. The built-in `txtspm` extension is bundled with the interpreter.

Install flow: `handleInstallExtension` adds the extension to the config JSON. Run flow: `handleRunExtension` requires the module and calls its `start()` function.

---

<div class="pager">
  <a href="#developer">&laquo; Dev Docs Home</a>
  <a href="#dev-helpers" class="next">Next: Helpers &raquo;</a>
</div>
