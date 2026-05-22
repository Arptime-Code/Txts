# txts

> **A minimalist programming language where folders are libraries and files are functions.**

[![npm version](https://img.shields.io/npm/v/txts?color=blue)](https://www.npmjs.com/package/txts)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](package.json)

---

## Quick Start

> **Note:** Not yet published to npm. Clone the repo and run from source for now.

```bash
git clone https://github.com/arptime/Txts.git
cd Txts

cat > hello.txts << 'EOF'
IMPORT txts
VARIABLE txts.OUTPUT "Hello, world!"
EOF

node bin/txts hello.txts
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
- [Contributing](#contributing)
- [License](#license)

---

## Why txts?

- **Only 3 commands** &mdash; `IMPORT`, `CALL`, `VARIABLE`. That's it.
- **Library-based** &mdash; Code is organized into libraries with simple dot notation (`lib.function`).
- **Self-documenting** &mdash; Non-command lines are treated as comments, so every file is also plain-text documentation.
- **No build step** &mdash; Run `.txts` files directly with Node.js.
- **Built-in package manager** &mdash; Share and reuse code with `txtspm`.

---

## Language Overview

### The Three Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `IMPORT` | Import a library namespace | `IMPORT lib` |
| `CALL` | Execute a function from a library | `CALL lib.sayhello` |
| `VARIABLE` | Append a value to a variable | `VARIABLE txts.OUTPUT "hello"` |

### Comments

Any line that does **not** start with a keyword is treated as a comment:

```txts
This is a comment. It's completely ignored by the interpreter.

IMPORT txts
VARIABLE txts.OUTPUT "Hello"
```

### Variables & Output

Variables use **dot notation**: `library.name`. The built-in `txts.OUTPUT` variable is what gets printed when your program finishes.

```txts
IMPORT txts

VARIABLE txts.OUTPUT "Hello, "
VARIABLE txts.OUTPUT "world!"
```

Output: `Hello, world!`

Values **append** to variables &mdash; each `VARIABLE` call adds to whatever was there before. Use `txts.CLEAR` to reset a variable to empty.

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
VARIABLE lib.greeting "Howdy"
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
git clone https://github.com/arptime/Txts.git
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
| [Basic Syntax](docs/syntax.html) | The three commands |
| [Variables & OUTPUT](docs/variables.html) | Storing and outputting values |
| [IMPORT & Libraries](docs/imports.html) | Using libraries and namespaces |
| [CALL & Functions](docs/calls.html) | Executing library functions |
| [The txts Library](docs/txts-library.html) | Built-in variables and sentinels |
| [Project Structure](docs/project-structure.html) | Organizing your code |
| [Package Manager](docs/txtspm.html) | Sharing code with txtspm |
| [Examples](docs/examples.html) | Complete working programs |

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
VARIABLE txts.OUTPUT "Hello, world!"
```

### Greeting Function

```txts
# lib/greet.txts
IMPORT txts
VARIABLE lib.greeting "Howdy"

# main.txts
IMPORT txts
IMPORT lib
CALL lib.greet
VARIABLE txts.OUTPUT lib.greeting
```

### Using CLEAR

```txts
IMPORT txts
VARIABLE txts.OUTPUT "This will be cleared"
VARIABLE txts.OUTPUT txts.CLEAR
VARIABLE txts.OUTPUT "Fresh start"
```

Output: `Fresh start`

---

## Contributing

Contributions are welcome! See the [Branching & Merging Strategy](ROADMAP.md#-branching--merging-strategy) in the roadmap for the workflow.

1. Fork the repository
2. Create a feature branch from `dev`: `git checkout -b feat/my-feature`
3. Make your changes
4. Run the tests: `npm test`
5. Open a pull request against `dev`

---

## License

[Apache 2.0](LICENSE) &copy; 2026 arptime
