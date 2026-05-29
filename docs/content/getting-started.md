# Getting Started

Welcome to txts! This guide will help you set up your environment and write your first program.

## Installation

Before you begin, make sure you have [Node.js](https://nodejs.org/) installed (version 14 or later).

To install txts globally via npm:

```
npm install -g txts
```

If you prefer to run from source, clone the repository and link it:

```
git clone https://github.com/your-org/txts.git
cd txts
npm install
npm link
```

## Your First Program

Create a file called `hello.txts`:

```txts
IMPORT txts
ADD txts.OUTPUT "Hello, world!"
```

Run it:

```
txts hello.txts
```

You should see:

```
Hello, world!
```

## What Just Happened?

- `IMPORT txts` — Brings the built-in `txts` library into scope
- `ADD txts.OUTPUT "Hello, world!"` — Appends the string `"Hello, world!"` to the special `OUTPUT` variable
- When the program finishes, the contents of `txts.OUTPUT` are printed to stdout

## Next Steps

- Learn the [Basic Syntax](#syntax) of the four commands
- Understand [Variables & OUTPUT](#variables) in detail
- Explore [Examples](#examples) of complete programs
