# txts

> **A text assembler and manager. Folders are libraries, files are functions.**

[![npm version](https://img.shields.io/npm/v/txts?color=blue)](https://www.npmjs.com/package/txts)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](package.json)

---

## Quick Start

> **Note:** Not yet published to npm. Clone the repo and run from source for now.

```bash
npm install -g txts
```

Create a file called `hello.txts`:

```txts
IMPORT txts
ADD txts.OUTPUT "Hello, world!"
```

Then run it:

```bash
txts hello.txts
# Output: Hello, world!
```

---

## Table of Contents

- [Why txts?](#why-txts)
- [Language Overview](#language-overview)
- [Installation](#installation)
- [Usage](#usage)
- [Full Documentation](#full-documentation)
- [Examples](#examples)
- [License](#license)

---

## Why txts?

- **Only 4 commands** &mdash; `IMPORT`, `CALL`, `ADD`, and `REPLACE`. That's it.
- **Library-based** &mdash; Code is organized into libraries with simple dot notation (`lib.function`).
- **Synchronous** &mdash; Predictable, sequential execution. No async, no parallelism.
- **Reliability through composition** &mdash; Many small, carefully-crafted libraries compose into reliable systems.
- **Delegates logic** &mdash; The actual computation happens in other languages; txts assembles and coordinates.
- **Built-in package manager** &mdash; Share and reuse code with `txtspm`.

---

## Language Overview

### The Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `IMPORT` | Import a library namespace | `IMPORT lib` |
| `CALL` | Execute a function from a library | `CALL lib.sayhello` |
| `ADD` | Append a value to a variable chain | `ADD txts.OUTPUT "hello"` |
| `REPLACE` | Replace a variable's chain or redirect it | `REPLACE lib.result lib.other` |

### Comments

Any line that does **not** start with a keyword is treated as a comment:

```txts
This is a comment. It's completely ignored by the interpreter.

IMPORT txts
ADD txts.OUTPUT "Hello"
```

### Variables & Output

Variables use **dot notation**: `library.name`. The built-in `txts.OUTPUT` variable is what gets printed when your program finishes.

```txts
IMPORT txts

ADD txts.OUTPUT "Hello, "
ADD txts.OUTPUT "world!"
```

Output: `Hello, world!`

Values **append** to variables &mdash; each `ADD` call adds to whatever was there before. Use `txts.CLEAR` to reset a variable to empty.

### Libraries & Functions

Folders are libraries, files are functions. A file at `lib/greet.txts` is called `lib.greet`.

```txts
IMPORT lib         # Mark the lib namespace as usable
CALL lib.greet     # Execute lib/greet.txts
```

Libraries must be imported before they can be used. Functions set variables in their library's namespace:

```txts
# lib/greet.txts
IMPORT txts
ADD lib.greeting "Howdy"
```

### Built-in Library (`txts`)

| Variable | Purpose |
|----------|---------|
| `txts.OUTPUT` | The program's output (printed at the end) |
| `txts.CLEAR` | A sentinel that clears a variable to empty |

### Package Manager

Install and share packages with `txtspm`:

```bash
txts extension install txtspm
txts extension txtspm
```

---

## Installation

### Via npm (recommended)

```bash
npm install -g txts
```

### From source

```bash
git clone https://github.com/Arptime-Code/Txts.git
cd Txts
npm link
```

### Requirements

- **Node.js** v14 or later

---

## Usage

```bash
txts <file.txts> [output.txt]
```

- **`file.txts`** &mdash; Path to the program to run.
- **`output.txt`** &mdash; Optional file path to write output to. If omitted, output is written to **stdout**.

### Flags

| Flag | Description |
|------|-------------|
| `--help`, `-h` | Show help message |
| `--version`, `-v` | Print version number |

### Examples

```bash
# Write output to stdout
txts hello.txts

# Write output to a file
txts hello.txts result.txt

# Print version
txts --version

# Show help
txts --help
```

### Extensions

```bash
txts extension install txtspm     # Install the package manager
txts extension txtspm              # Run the package manager
```

---

## Full Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

### Tutorial

| Page | Description |
|------|-------------|
| [Getting Started](docs/getting-started.html) | Setup and first program |
| [Basic Syntax](docs/syntax.html) | The four commands |
| [Variables & OUTPUT](docs/variables.html) | Storing and outputting values |
| [IMPORT & Libraries](docs/imports.html) | Using libraries and namespaces |
| [CALL & Functions](docs/calls.html) | Executing library functions |
| [The txts Library](docs/txts-library.html) | Built-in variables and sentinels |
| [Project Structure](docs/project-structure.html) | Organizing your code |
| [REPL Mode](docs/repl.html) | Interactive txts session |
| [Package Manager](docs/txtspm.html) | Sharing code with txtspm |
| [Examples](docs/examples.html) | Complete working programs |

The documentation is also available online at:
**[https://arptime-code.github.io/Txts/](https://arptime-code.github.io/Txts/)**

### Developer Reference

| Page | Description |
|------|-------------|
| [Architecture Overview](docs/developer.html) | How txts works internally |
| [CLI & Entry Point](docs/dev-cli.html) | The command-line interface |
| [Parser](docs/dev-parser.html) | How txts code is parsed |
| [Executor](docs/dev-executor.html) | The core execution engine |
| [Resolver](docs/dev-resolver.html) | How libraries and functions are resolved |
| [Builtins](docs/dev-builtins.html) | Built-in variables and constants |
| [txtspm Extension](docs/dev-txtspm.html) | Package manager internals |
| [REPL](docs/dev-repl.html) | Interactive mode |
| [Error Handling](docs/dev-errors.html) | Error types and how to extend txts |

---

## Examples

### Hello World

```txts
IMPORT txts
ADD txts.OUTPUT "Hello, world!"
```

### Greeting Function

```txts
# lib/greet.txts
IMPORT txts
ADD lib.greeting "Howdy"

# main.txts
IMPORT txts
IMPORT lib
CALL lib.greet
ADD txts.OUTPUT lib.greeting
```

### Using CLEAR

```txts
IMPORT txts
ADD txts.OUTPUT "This will be cleared"
ADD txts.OUTPUT txts.CLEAR
ADD txts.OUTPUT "Fresh start"
```

Output: `Fresh start`

---


## Transparency

See [AI_DISCLOSURE.md](AI_DISCLOSURE.md) for details on how AI was used in this project.

## License

[Apache 2.0](LICENSE) &copy; 2026 Arptime-Code
