# The txts Built-in Library

The `txts` library is the only built-in library in the language. It requires no filesystem directory — it's always available and provides the core mechanics for program output.

## Variables in the txts Library

| Variable | Type | Writable? | Description |
|----------|------|-----------|-------------|
| `txts.OUTPUT` | String | Yes | The output channel. Whatever value is in this variable at the end of program execution is written to stdout or a file. |
| `txts.CLEAR` | String (empty) | No | A sentinel value that evaluates to an empty string. Used to clear other variables. |

> [!WARNING]
> The `txts` library is **read-only**. You cannot create arbitrary variables in it (e.g., `ADD txts.secret "no"` will throw an error). Only `txts.OUTPUT` is writable.

## txts.OUTPUT

This is the primary way to produce output from a txts program. Every program that produces output must use this variable. Since `ADD` **appends**, you can build up output incrementally:

```txts
IMPORT txts
ADD txts.OUTPUT "Hello, "
ADD txts.OUTPUT "world!"
```

You can also append another variable's value to OUTPUT:

```txts
IMPORT txts
IMPORT lib
ADD txts.OUTPUT lib.greeting
```

If `txts.OUTPUT` is never written to, it defaults to an empty string, and the program outputs nothing.

## txts.CLEAR

`txts.CLEAR` is a special sentinel variable. Unlike a regular `ADD` command (which appends), using `txts.CLEAR` as the source **overwrites** the target variable to an empty string — it resets it:

```txts
IMPORT txts
IMPORT suite
ADD suite.secret "This will disappear"
ADD suite.secret txts.CLEAR
ADD txts.OUTPUT suite.secret  # Outputs nothing (empty string)
```

The `CLEAR` variable itself is read-only — you cannot change its value.

## Always Available

The `txts` namespace is created automatically when a program starts. However, you still need to `IMPORT txts` in each file that uses it, just like any other library. This keeps every file self-documenting about its dependencies.

## Best Practices

- Always `IMPORT txts` at the top of any file that reads or writes `txts.OUTPUT`
- Use `txts.CLEAR` to reset intermediate variables when needed
- Use multiple `ADD txts.OUTPUT` calls to build output incrementally — they append rather than overwrite
- Never try to create custom variables in the `txts` namespace — use your own library instead
