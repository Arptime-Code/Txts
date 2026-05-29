# IMPORT & Libraries

The `IMPORT` command loads a library and makes its namespace available in the current file.

## Basic Import

To import a library, simply state its name:

```txts
IMPORT txts
IMPORT lib
IMPORT external
```

Each import creates a namespace. After import, you can reference variables and functions from that library using dot notation: `lib.greeting`, `external.sayhello`, etc.

## How Libraries Work

A library is a directory under `.local-txtspm/` in your project root. Each `.txts` file inside that directory becomes a "function" in the library.

Project structure example:

```
myproject/
  .local-txtspm/
    lib/
      greet.txts
      sayhello.txts
      combine.txts
    external/
      hello.txts
      goodbye.txts
```

When you write `IMPORT lib`, txts looks for `.local-txtspm/lib/` and loads all `.txts` files in it.

## Importing the txts Built-in Library

`IMPORT txts` imports the built-in library that gives you access to `txts.OUTPUT` and `txts.CLEAR`. This library is always available — there's no filesystem directory for it.

> [!WARNING]
> The `txts` library is read-only. You cannot create arbitrary variables in it. Only `txts.OUTPUT` is writable.

## Per-File Imports

Each `.txts` file must import every library it uses. Imports do **not** carry over from one file to another. This is by design — every file explicitly declares its dependencies at the top.

```txts
# main.txts
IMPORT txts
IMPORT lib
IMPORT suite
ADD suite.result lib.greeting
ADD txts.OUTPUT suite.result
```

```txts
# .local-txtspm/lib/greet.txts
IMPORT txts
IMPORT lib    # Library imports itself for its variables
ADD lib.greeting "Hello from library"
```

> [!TIP]
> Library files also need to import their own namespace to access variables defined in sibling files. A library file in `.local-txtspm/lib/` uses `IMPORT lib` to read variables set by other files in the same library.

## Circular Import Protection

txts detects and prevents circular imports. If library A imports library B, which imports library A, the second import silently returns without re-executing the files.

## Import Convention

- Place all `IMPORT` statements at the top of your file
- Import `txts` first, then your own library, then third-party libraries
- Every file must import `txts` if it uses `txts.OUTPUT` or `txts.CLEAR`
- Library files must import their own namespace to read sibling variables
