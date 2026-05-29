# Frequently Asked Questions

## General

### What is txts?

txts is a minimalist, synchronous programming language — a **text assembler and manager**. It has only **four commands**: `IMPORT`, `CALL`, `ADD`, and `REPLACE`. Every line is one instruction, non-command lines are treated as comments. The language itself doesn't perform heavy logic — it delegates that to other languages, assembling and coordinating their results into reliable systems.

### Is txts a serious language for production use?

Yes. txts is designed for building reliable systems through composition of many small, well-crafted libraries. Because each individual part is carefully built, the combined system can be trusted. Performance is not a concern — the real computation is delegated to other languages, so txts itself only assembles text. It can be used for glue code, automation, large-scale applications (built from many small libraries), and even indirectly for system programming through language bindings. It is **synchronous by design** — no async, no parallelism, just predictable sequential execution.

### What makes txts different from other languages?

- **Four commands total** — You can learn the entire language in under 10 minutes
- **Text assembler by design** — Not a language for heavy logic; it delegates computation to other languages and manages the results
- **Synchronous** — Predictable, sequential execution with no async or parallelism
- **Library-based architecture** — Code is organized into namespaced libraries with dot notation
- **Append-only chains** — `ADD` always appends; there's no overwrite (except via `txts.CLEAR`)
- **No build step** — Run `.txts` files directly with Node.js

### Is txts related to TypeScript or JavaScript?

No. txts is its own language with a custom parser and executor. The interpreter is written in JavaScript for Node.js, but the language itself has no relation to JavaScript or TypeScript.

## Usage

### How do I run a .txts file?

From the Txts project root, run:

```
txts myfile.txts
```

You can also pipe output to a file:

```
txts myfile.txts output.txt
```

### How do I install txts?

See the [Installation Guide](#installation) for full instructions. You can run it directly from source or install it globally via npm once published.

### Do I need a package.json file?

For now, txts finds your project root by looking for a `.local-txtspm/` directory. If none is found, the directory containing your `.txts` file is used as the root. A dedicated configuration file is planned for the future.

### How do I create a library?

Create a directory inside `.local-txtspm/` and add `.txts` files to it. Each file becomes a function in that library. For example, `.local-txtspm/mylib/greet.txts` becomes the function `mylib.greet`. See the [txtspm docs](#txtspm) for more details.

### How do I share my library with others?

Use the built-in [txtspm package manager](#txtspm). Run `txtspm init` to set up your project, then `txtspm save` to save it to the global store. Others can then `txtspm import your-library` to use it.

## Language

### Why does ADD append instead of overwrite?

txts is designed for assembling text step by step. Each `ADD` call contributes to a result incrementally, letting you build output across multiple lines and function calls. If you need to reset a variable, use `txts.CLEAR` as the source value.

### What is txts.CLEAR?

`txts.CLEAR` is a special sentinel variable in the built-in txts library. When used as the source value in a `ADD` command, it **overwrites** the target variable to an empty string (instead of the usual append behavior). See [The txts Library](#txts-library) for details.

### Can I create variables in the txts namespace?

No. The `txts` library is read-only except for `txts.OUTPUT`. Trying to write to `txts.something` will throw an error. Create variables in your own library namespace instead.

### How does CALL work?

`CALL` executes a `.txts` file from an imported library. It runs in the same shared variable namespace (so it can read and modify variables), but gets its own isolated file imports — the caller's imports are restored when the call returns. See [CALL & Functions](#calls) for details.

### Is there a recursion limit?

Yes. Recursive calls are limited to **50 levels deep** to prevent stack overflow. This is tracked per-call-chain.

### Why do I need to IMPORT txts in every file?

Every `.txts` file must explicitly import the libraries it uses, including `txts`. This ensures every file clearly declares its dependencies — you can always tell exactly what a file needs just by looking at the top of the file.

## Errors & Debugging

### What happens if my file has a syntax error?

The parser will throw an error (e.g., `Error: Unknown command "WRITE"`), which is caught by the CLI handler and printed to stderr. The program stops execution at that point.

### I see "library is not imported" — what does that mean?

You tried to read from or write to a variable in a library you haven't imported. Add `IMPORT libraryname` at the top of your file. Every file needs its own imports — they don't carry over from other files.

### How do I see what version I'm running?

```
txts --version
```

### How do I get help from the CLI?

```
txts --help
```

## Project & Community

### What is the license?

txts is licensed under **Apache 2.0**. See the [LICENSE](https://github.com/Arptime-Code/Txts/blob/main/LICENSE) file on GitHub for the full terms.

### How can I contribute?

Check out [CONTRIBUTING.md](https://github.com/Arptime-Code/Txts/blob/dev/CONTRIBUTING.md) on GitHub for the full guide. The project uses a branching workflow with `main` (stable), `dev` (integration), `feat/*` (features), and `fix/*` (bug fixes).

### Where can I ask questions?

Open a [Discussion](https://github.com/Arptime-Code/Txts/discussions) on GitHub, or [open an Issue](https://github.com/Arptime-Code/Txts/issues/new) for bug reports and feature requests.
