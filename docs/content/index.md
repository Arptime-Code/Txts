# txts Language Tutorial

**txts** is a minimalist, synchronous programming language — a **text assembler and manager**. Every line is a single command — no complex expressions, no nested syntax — just plain-text instructions that let you assemble output from many small, focused libraries. The real logic is handled by other languages; txts coordinates and connects the pieces.

> [!TIP]
> **New to txts?** Start with [Getting Started](#getting-started) to set up your environment and write your first program.

## Why txts?

- **Minimal syntax** — Only four commands: `IMPORT`, `CALL`, `ADD`, `REPLACE`
- **Library-based** — Code is organized into libraries with dot-notation references
- **Synchronous** — Predictable, sequential execution — no async or parallelism
- **Reliability through composition** — Many small, well-crafted libraries compose into dependable systems
- **Delegates logic** — Heavy computation happens in other languages; txts assembles and manages the results
- **Built-in package manager** — Share and reuse code with txtspm

## Quick Overview

A txts program is a sequence of lines in a `.txts` file. Each line is either a command or a comment:

```txts
# This is a comment

# Import libraries you need
IMPORT txts
IMPORT lib

# Set the output
ADD txts.OUTPUT "Hello, world!"
```

Run it with (from the Txts project root):

```
txts myfile.txts
```

> [!TIP]
> **Note:** You need to specify the path to the txts interpreter. If your file is in a different project, use the full path: `txts myfile.txts`

## What You'll Learn

1. [Getting Started](#getting-started) — Installation and first program
2. [Basic Syntax](#syntax) — How to write txts code
3. [Variables & OUTPUT](#variables) — Storing and outputting values
4. [IMPORT & Libraries](#imports) — Using libraries and namespaces
5. [CALL & Functions](#calls) — Executing library functions
6. [The txts Library](#txts-library) — Built-in variables and sentinels
7. [Project Structure](#project-structure) — Organizing your code
8. [REPL Mode](#repl) — Interactive txts session
9. [Package Manager](#txtspm) — Sharing code with txtspm
10. [Examples](#examples) — Complete working programs

## Resources

- [FAQ](#faq) — Frequently asked questions about txts
- [Installation Guide](#installation) — Install txts via npm

## Reference

For a deep dive into the internals of txts, see the [Developer Documentation](#developer).
