# CALL & Functions

The `CALL` command executes a function from an imported library. In txts, a "function" is simply another `.txts` file that lives inside a library directory.

## Basic Call

To call a function, use `CALL` followed by a dotted reference to the function:

```txts
IMPORT lib
CALL lib.sayhello
```

This executes the file `.local-txtspm/lib/sayhello.txts`.

## How Functions Work

When you call a function, txts:

1. Finds the corresponding `.txts` file in the library directory
2. Creates a fresh `fileImports` context (isolation)
3. Executes all commands in that file
4. Restores the caller's `fileImports` after completion

> [!TIP]
> Functions execute in the same shared variable namespace. This means a function can modify variables that the caller can then read.

## Function Example

A library with multiple functions:

```txts
# .local-txtspm/lib/sayhello.txts
IMPORT txts
ADD txts.OUTPUT "Called function hello!"
```

```txts
# .local-txtspm/lib/greet.txts
IMPORT txts
IMPORT lib
ADD lib.greeting "Hello from library"
```

Then from your main file:

```txts
IMPORT lib
CALL lib.sayhello     # Outputs "Called function hello!"
CALL lib.greet       # Sets lib.greeting
```

## Chaining Functions

Functions can set variables in their library namespace, which other functions (or the caller) can read. This is how data flows between functions:

```txts
# main.txts
IMPORT txts
IMPORT lib
CALL lib.greet           # Sets lib.greeting
ADD txts.OUTPUT lib.greeting  # Outputs it
```

## Calling External Library Functions

Functions from external (imported) libraries work the same way:

```txts
IMPORT external
CALL external.goodbye
```

## Call Rules

- The library must be `IMPORT`ed before you can call its functions
- Functions are referenced as `library.functionname`
- The function name corresponds to a `.txts` file in the library directory
- Recursion is limited to 50 levels deep
- When a function file runs, it gets its own isolated file imports — the caller's imports are restored afterward

## Functions vs Variables

| Aspect | CALL | ADD |
|--------|------|-----|
| Purpose | Execute a file | Set or copy a value |
| Syntax | `CALL lib.func` | `ADD lib.var value` |
| Side effects | May modify any variables | Appends to exactly one variable |
| File imports | Isolated from caller | Uses current file imports |
