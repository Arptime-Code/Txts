# REPL (extensions/repl.js)

The REPL module provides a reusable interactive Read-Eval-Print-Loop using Node.js `readline`. It's used by the txtspm extension for interactive commands.

## createRepl(commandHandler, options)

Creates a REPL instance with a custom prompt and greeting:

```
var repl = require('./repl');

repl.createRepl(handleCommand, {
  prompt: 'txtspm> ',
  greeting: 'txtspm package manager. Type "help" for commands.'
});
```

## Key Features

| Feature | Description |
|---------|-------------|
| Exit commands | `exit`, `quit`, `q` all exit the REPL |
| Empty lines | Silently ignored (no handler call) |
| Error handling | Errors from the command handler are caught and printed without crashing the REPL |
| Customizable prompt | Set via `options.prompt` |
| Greeting message | Displayed on startup via `options.greeting` |

## Usage in txtspm

The txtspm extension uses the REPL to provide an interactive command interface. The command handler splits input by spaces and dispatches to the appropriate txtspm operation:

```
function handleCommand(input) {
  var parts = input.trim().split(/\s+/);
  var cmd = parts[0];
  var args = parts.slice(1);
  switch (cmd) { ... }
}
```

---

<div class="pager">
  <a href="#dev-txtspm">&laquo; txtspm Extension</a>
  <a href="#dev-errors" class="next">Next: Error Handling &raquo;</a>
</div>
