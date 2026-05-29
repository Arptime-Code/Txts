# ADD & REPLACE Reference

How txts builds and reshapes variables through chains, eager resolution, forward references, and replacement.

## 1. ADD — Appending to a Chain

### ADD lib.var "string"

Appends a **fixed string value** to the variable's chain. No resolution needed — the string is concrete immediately.

```txts
ADD tmpTests.greeting "Hello, World!"
ADD txts.OUTPUT tmpTests.greeting
```

```
# tmpTests.greeting  = [ "Hello, World!" ]
# txts.OUTPUT        resolves greeting → "Hello, World!"
```

**Output:** `Hello, World!`

### ADD lib.var lib.ref

Attempts to **resolve the reference immediately**. If the referenced variable already exists, its current value is stored (eager). If it doesn't exist yet, a **forward ref** is stored that resolves once the variable is later defined.

```txts
ADD tmpTests.result "Letter: "
ADD tmpTests.result tmpTests.name  # name exists? → eager resolve
ADD tmpTests.name  "B"               # defined after, too late for result
ADD txts.OUTPUT tmpTests.result
```

| Step | tmpTests.name | tmpTests.result |
|------|---------------|-----------------|
| `ADD result "Letter: "` | — | `["Letter: "]` |
| `ADD result name` | `["A"]` (exists) | `["Letter: ", "A"]` **eager** |
| `ADD name "B"` | `["A", "B"]` | unchanged |
| `OUTPUT ← result` | | `"Letter: A"` |

**Output:** `Letter: A`

> [!TIP]
> **Variable exists → eager.** If `name` had *not* existed at ADD time, a lazy forward ref would have been stored instead.

### ADD txts.OUTPUT lib.ref — Immediate resolution

**txts.OUTPUT is special.** Unlike chain variables, OUTPUT resolves every source **immediately** at the moment the ADD runs. If the referenced variable doesn't exist yet, it appends **nothing** — no forward ref is stored.

```txts
ADD txts.OUTPUT "Hello, "
ADD txts.OUTPUT tmpTests.name  # name doesn't exist → outputs nothing
ADD txts.OUTPUT "!"
ADD tmpTests.name "Alice"          # too late, OUTPUT already processed
```

**Output:** `Hello, !`

### Forward ref via chain, then output

Build into a chain variable first. Forward refs are stored, then resolved when OUTPUT reads it at the end.

```txts
ADD tmpTests.result "Hello, "
ADD tmpTests.result tmpTests.name  # name doesn't exist → stores forward ref
ADD tmpTests.result "!"
ADD tmpTests.name  "Alice"           # name defined → forward ref resolves
ADD txts.OUTPUT tmpTests.result     # resolves chain → "Hello, Alice!"
```

**Output:** `Hello, Alice!`

> [!TIP]
> **Key difference:** Chain variables support forward refs. OUTPUT resolves immediately and cannot see the future.

## 2. REPLACE — Replacing a Chain

### REPLACE lib.var "text"

Throws away the variable's entire chain and replaces it with the given string. The string is concrete immediately.

```txts
ADD tmpTests.old    "old value"
ADD tmpTests.result "Result: "
ADD tmpTests.result tmpTests.old  # resolves "old value" → stores it
REPLACE tmpTests.old "NEW"            # old's chain is now ["NEW"]
ADD tmpTests.result " | "
ADD tmpTests.result tmpTests.old  # resolves "NEW" now
```

**Output:** `Result: old value | NEW`

> [!TIP]
> **Note:** The first ADD resolved `old` to `"old value"` before REPLACE happened. REPLACE only affects future ADDs reading `old`.

### REPLACE lib.var1 lib.var2

Replaces `var1`'s chain with a **redirect** (reference) to `var2`. Future ADDs reading `var1` follow the redirect and get `var2`'s value. Also scans all chains for leftover refs to `var1` and updates them to point to `var2`.

```txts
ADD tmpTests.x "X"
ADD tmpTests.y "Y"
ADD tmpTests.result tmpTests.x  # resolves "X"
REPLACE tmpTests.x tmpTests.y       # x now redirects to y
ADD tmpTests.result " + "
ADD tmpTests.result tmpTests.x  # follows redirect → resolves "Y"
```

**Output:** `X + Y`

## Summary

| Command | Target | Behavior | When resolved |
|---------|--------|----------|---------------|
| `ADD var "string"` | chain | Appends the string as a value item | Immediate — strings are concrete |
| `ADD var lib.ref` | chain | If ref exists → resolve eagerly and store value. If ref doesn't exist → store forward ref | Eager if exists; lazy (forward) if not |
| `ADD txts.OUTPUT ...` | OUTPUT | Resolves source immediately. If ref doesn't exist → outputs nothing | Always immediate — no forward refs |
| `REPLACE var "text"` | chain | Replaces entire chain with the string. Scans for leftover refs. | Immediate — string is concrete |
| `REPLACE var1 var2` | chain | Replaces chain with a redirect to var2. Scans for leftover refs to var1. | Redirect resolves when var1 is read later |
