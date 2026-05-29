# Basic Syntax

txts has only **four commands**. Every line in a `.txts` file is one of these commands, a comment, or blank.

## The Four Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `IMPORT` | Import a library namespace | `IMPORT lib` |
| `CALL` | Execute a function from a library | `CALL lib.sayhello` |
| `ADD` | Append a value to a variable chain | `ADD txts.OUTPUT "hello"` |
| `REPLACE` | Resolve a chain, replace refs with a string, or replace matching refs with a value | `REPLACE lib.result`, `REPLACE lib.var "text"`, or `REPLACE lib.var lib.ref` |

## Comments

Any line that does **not** start with `IMPORT`, `CALL`, `ADD`, or `REPLACE` is treated as a comment. This means you can write free-form text anywhere in your files:

```txts
This line is a comment
It can contain any text at all

Below is actual code:
IMPORT txts
ADD txts.OUTPUT "Hello"
```

> [!TIP]
> Use comments to document what each section of your code does. Non-command lines are ignored by the interpreter, so you can write free-form explanations anywhere.

## Dotted References

Variables and functions are referenced using **dot notation**: `library.name`.

The part before the dot is the **library name** (namespace). The part after is the **variable or function name**.

```
txts.OUTPUT       -- "txts" is the library, "OUTPUT" is the variable
lib.greeting      -- "lib" is the library, "greeting" is the variable
external.sayhello -- CALL uses the same notation
```

## Strings

String values are written inside double quotes:

```
"Hello, world!"
"Any text in double quotes"
```

Strings can be escaped with backslashes:

```
"She said \"hello\""
```

## Case Sensitivity

All commands are **uppercase**: `IMPORT`, `CALL`, `ADD`, `REPLACE`. Library names and variable names are case-sensitive.

## Line Format

Each line follows a strict structure:

| Command | Format |
|---------|--------|
| `IMPORT` | `IMPORT libraryname` |
| `CALL` | `CALL library.functionname` |
| `ADD` | `ADD library.variablename "value"` or `ADD library.variablename otherlib.variable` |
| `REPLACE` | `REPLACE library.variablename` (freeze), `REPLACE library.variablename "text"` (replace refs), or `REPLACE library.variablename otherlib.variable` (replace matching refs) |

Leading whitespace is ignored — you can indent for readability if you like.

## Best Practices

- **Import at the top** — Put all `IMPORT` statements at the beginning of your file
- **Use comments** — Explain what each section does
- **One command per line** — Each line has exactly one instruction
- **Use the suite convention** — In test files, create variables in your own library namespace
