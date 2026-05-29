# REPL Mode

The REPL (Read-Eval-Print Loop) lets you run txts commands interactively. Instead of writing a `.txts` file and executing it, you type commands one at a time and see the results immediately. This is great for experimenting, testing libraries, and building up output incrementally.

## Starting the REPL

From the project root, run:

```
txts repl
```

You'll see a greeting and a prompt:

```
txts REPL v0.1.0 — Type txts commands interactively.
  Commands: IMPORT  CALL  ADD  REPLACE
  Meta:     .help  .clear  .vars  .reset  .mode  exit

txts>
```

The `txts>` prompt means the REPL is ready for your input.

## String Escape Sequences

By default, txts interprets escape sequences in string literals — `\n` becomes a newline, `\t` becomes a tab, `\\` becomes a backslash, and so on. This uses the same escape syntax as JSON, so all standard JSON escape sequences are supported:

| Sequence | Result |
|----------|--------|
| `\n` | Newline |
| `\t` | Tab |
| `\\` | Backslash |
| `\"` | Double quote |
| `\r` | Carriage return |
| `\uXXXX` | Unicode character (e.g. `\u00e9` for é) |

If you need the literal characters (e.g. you want to print `\t` as two characters and not a tab), use the `--raw` flag when starting the REPL:

```
txts --raw repl
```

In raw mode, no escape sequences are interpreted — strings are used exactly as written.

## Using the REPL

Type any valid txts command at the prompt. The REPL maintains a persistent context — variables accumulate across commands, just like in a file.

### Example Session

```txts
IMPORT txts
# Output: (imported txts)

ADD txts.OUTPUT "Hello, world!"
# Output: Hello, world!

ADD txts.OUTPUT " Second line."
# Output: Hello, world! Second line.
```

Each `ADD` command appends to the target, just as it would in a file. After every command, the REPL shows you the current value of `txts.OUTPUT` if it changed and is non-empty.

### Calling Library Functions

If your project has libraries installed, you can call them interactively:

```txts
IMPORT mylib
# Output: (imported mylib)

ADD txts.OUTPUT "Prefix: "
CALL mylib.transform
# Output now includes whatever mylib.transform appended
```

## Meta-Commands

The REPL supports a few commands prefixed with `.` that manage the session itself:

| Command | Description |
|---------|-------------|
| `.help` | Show the list of available commands and meta-commands |
| `.clear` | Clear the current value of `txts.OUTPUT` to empty |
| `.vars` | List all variables and their current values across all imported libraries |
| `.reset` | Reset the entire execution context to a clean state — clears all variables and imports |
| `.mode [raw\|parsed]` | Show or set the string escape mode — `raw` keeps escape sequences literal, `parsed` interprets them |
| `exit`, `quit`, `q` | Exit the REPL |

## Comments

If you type a line that doesn't start with `IMPORT`, `CALL`, `ADD`, or `REPLACE`, the REPL treats it as a comment and tells you so. This is the same behavior as in `.txts` files — non-command lines are ignored.

## Errors

If a command produces an error (e.g., calling an unimported library or referencing a variable that doesn't exist), the REPL catches the error, prints it, and returns you to the prompt. The context is preserved so you can fix the issue and continue.

## Exiting the REPL

Type `exit`, `quit`, or `q` at any time to leave the REPL.

## REPL vs. Running a File

| Feature | REPL | File (`txts file.txts`) |
|---------|------|------------------------|
| Execution | Line by line, interactive | Whole file at once |
| Context | Persists across commands | Fresh per file execution |
| Output display | Shown after each command | Written to stdout or file at end |
| Best for | Experimentation, testing, incremental building | Production scripts, automation |
