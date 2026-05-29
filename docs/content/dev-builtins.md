# Builtins (general/builtins.js)

The builtins module defines the built-in `txts` library — the only library that's available without a corresponding directory on disk. It provides the `OUTPUT` channel and the `CLEAR` sentinel.

## Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `TXTS_LIBRARY_NAME` | `'txts'` | The name of the built-in library namespace |
| `OUTPUT_VARIABLE_NAME` | `'OUTPUT'` | The output channel variable — its value becomes the program's output |
| `CLEAR_VARIABLE_NAME` | `'CLEAR'` | The clear sentinel — assigning this to a variable clears it |

## createBuiltinVariables()

Creates the initial variable state with the `txts` library pre-populated:

```
{
  txts: {
    OUTPUT: '',
    CLEAR: ''
  }
}
```

Key design details:

- **OUTPUT** starts as an empty string and accumulates via append
- **CLEAR** is always an empty string sentinel — its value never changes. When used as a source in `ADD`, the executor detects it and sets the target to `''` instead of appending
- The `txts` namespace is the only one that exists at context creation — all other namespaces are created lazily

## How Builtins Are Read-Only

The executor enforces that only `txts.OUTPUT` is writable in the `txts` library:

```
if (target.library === builtins.TXTS_LIBRARY_NAME &&
    target.name !== builtins.OUTPUT_VARIABLE_NAME) {
  throw new Error('Cannot assign to "txts...."');
}
```

This guard is in `executeAdd` and fires before any assignment is attempted.

---

<div class="pager">
  <a href="#dev-resolver">&laquo; Resolver</a>
  <a href="#dev-executor" class="next">Next: Executor &raquo;</a>
</div>
