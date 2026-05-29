# ADD & REPLACE — Deep Dive (v2)

> **Resources** · Last updated: May 2026

This page explains the exact runtime behavior of the two core assignment commands in txts — `ADD` and `REPLACE` — including the recent changes to how references resolve through variable chains. Understanding this is essential for writing correct, predictable txts programs.

---

## The Chain Model

Every txts variable is an **ordered chain of items**. When a variable is resolved (read), its items are concatenated in order:

```
Result of resolving myVar = item₁ + item₂ + item₃ + ...
```

There are two kinds of items:

| Item type | Meaning | Example |
|-----------|---------|---------|
| `{type: 'value', value: "hello"}` | A literal string | `ADD myVar "hello"` |
| `{type: 'ref', library: 'x', name: 'y'}` | A dynamic reference to another variable | `ADD myVar other.var` |

When a **ref** item is encountered during resolution, the executor follows it: it looks up the referenced variable, resolves that variable's chain, and substitutes the result inline.

```
myVar = ["Hello ", ref(other.name), "!"]
       → "Hello " + resolve(other.name) + "!"
```

---

## ADD — Append to Chain

```
ADD target source
```

**`ADD` always appends** to the target's chain — it never replaces or clears.

### Source is a string literal

Appends a single `{type: 'value'}` item:

```
ADD result "hello\n"
→ result = [{value: ""}, {value: "hello\n"}]
```

### Source is a reference to a variable

Two cases:

#### 1. Source variable exists with a chain (most common)

The items from the source's chain are **copied** into the target. This is a **snapshot** — the target gets its own copy so future changes to the source don't affect it. But **forward refs inside the chain are preserved** — they still resolve dynamically later.

```
ADD result tmpTests.code   ← code doesn't exist yet
ADD code "hello"           ← code now exists
→ result = [{value: ""}, {ref: code}]
→ At output time: resolves ref(code) → "hello"
```

If `code` already has a chain like `[{ref: code2}]` (because it was REPLACEd), the copy preserves the forward ref:

```
REPLACE code code2         ← code = [{ref: code2}]
→ global sub: result's ref(code) becomes ref(code2)
ADD fullCode result        ← copies result's items
→ fullCode = [{value: ""}, {value: "if\n"}, {ref: code2}, {value: "\nend"}]
ADD code2 "hello there"
→ At output: ref(code2) → "hello there" inside fullCode
```

#### 2. Source variable doesn't exist yet

A single `{type: 'ref'}` item is stored — a **forward reference**. When the target is later resolved, the ref will follow the chain. If the referenced variable never gets defined, the ref resolves to an empty string `""`.

```
ADD myVar undefinedVar
→ myVar = [{ref: undefinedVar}]
→ At output: undefinedVar doesn't exist → ""
```

### txts.OUTPUT — special immediate resolution

The built-in `txts.OUTPUT` variable is the only exception: it **resolves immediately** at `ADD` time. The resolved value is appended to an internal output buffer, not chained.

```
ADD txts.OUTPUT myVar     ← resolves myVar right now, appends to output buffer
ADD txts.OUTPUT "\n"      ← appends literal newline to output buffer
```

---

## REPLACE — Replace a Variable's Definition

```
REPLACE target source
```

**`REPLACE` replaces** the target's entire chain with exactly one item. It does not append.

### Source is a string literal

The target's chain is replaced with a single `{type: 'value'}` item. **No other variables are affected.** The target stays alive — future `ADD` operations can append to it.

```
REPLACE result ""
→ result = [{value: ""}]
ADD result "hi"
→ result = [{value: ""}, {value: "hi"}]
```

Chains that reference `result` keep their refs and follow the redirect naturally.

### Source is a reference to another variable

Two things happen:

#### 1. Target's own chain is replaced

The target's chain becomes `[{ref: source}]` — a single ref pointing to the source.

```
REPLACE code code2
→ code = [{ref: code2}]
```

#### 2. Global substitution

The executor scans **every chain in every variable** for `{type: 'ref'}` items pointing to the **target**. Each such ref is replaced with a ref to the **source**.

```
Before:        result = [{value: "if\n"}, {ref: code}, {value: "\nend"}]
REPLACE code code2
After:         result = [{value: "if\n"}, {ref: code2}, {value: "\nend"}]
               code   = [{ref: code2}]
```

This means `REPLACE` with a reference source is a **full redirect** — every reference to the target is rerouted to the source.

#### 3. Target variable is deleted

After global substitution, the target variable is **deleted** from the context. Any new `ADD something targetVar` after this point creates a `{type: 'ref'}` pointing to a variable that no longer exists — a **dead ref** that resolves to `""`.

```
REPLACE code code2          ← global sub: ref(code) → ref(code2). Delete code.
ADD result code             ← code is deleted → {ref: code} is a dead ref
→ At output: ref(code) → code deleted → ""
```

This prevents circular references: if `result` → `code` → `code2` → `result`, the REPLACE deletes `code`, so new refs to `code` are dead and the cycle is broken.

---

## What Changed & Why

The executor went through three iterations to arrive at the current behavior.

### Version 1 (original) — Eager resolution

`makeItem` checked if the source variable existed. If yes, it **eagerly resolved** the source's entire chain to a plain string and stored that string as a `{type: 'value'}`. This burned forward refs — any `{ref: code}` inside the source was resolved immediately to `""` if `code` didn't exist yet.

```
Problem: Forward refs couldn't survive a chain-copy.
ADD result code           ← code doesn't exist yet → {ref: code} (forward ref)
REPLACE code code2        ← global substitution works
ADD fullCode result       ← eager resolution: ref(code2) inside result
                          is resolved to "" because code2 doesn't exist yet
ADD code2 "hello there"   ← too late, fullCode already burned its forward ref
→ fullCode = "if\n\nend"  ← "hello there" never appears
```

### Version 2 — Always store a single ref

`makeItem` was changed to **always** store `{type: 'ref'}` for reference sources, never resolving eagerly. This preserved forward refs but made the target **dynamic** — it was just a pointer to the source. A later `REPLACE` on the source would affect all targets that pointed to it via global substitution.

```
Problem: Dynamic refs made targets vulnerable to REPLACE's global sub.
ADD fullCode result       ← {ref: result} (dynamic pointer)
REPLACE result ""         ← global sub: fullCode's ref(result) replaced with value("")
→ fullCode = [value("")]  ← fullCode was emptied indirectly
```

Also, storing `{ref: result}` meant that when the second `CALL` rebuilt `result`, `fullCode` would follow along dynamically — losing its snapshot of the first result.

### Version 3 (current) — Chain-copy for existing variables

When the source variable has an existing chain (array of items), `ADD` **copies those items** into the target. This gives a **snapshot** that:

- **Preserves forward refs** — `{ref: code2}` inside the chain stays as a ref and resolves dynamically later.
- **Is independent** from the source — future `REPLACE` on the source has no effect on the target (global sub only affects chains that have `{ref: target}`, and the target's copy doesn't).
- **Breaks circular chains** — combined with `REPLACE`'s delete behavior, cycles like `result → code → code2 → result` are prevented because `code` is deleted, making new refs to it dead.

```
Current behavior:
ADD result code           ← code doesn't exist → {ref: code} (forward ref)
REPLACE code code2        ← global sub: ref(code) → ref(code2). Delete code.
ADD fullCode result       ← chain-copy: copies result's items into fullCode
                          → [{value: ""}, {value: "if\n"}, {ref: code2}, {value: "\nend"}]
ADD code2 "hello there"   ← code2 is set
→ At output: fullCode resolves ref(code2) → "hello there"
→ fullCode = "if\nhello there\nend"  ← correct!
```

### REPLACE v1 vs v2

| Aspect | Before | After |
|--------|--------|-------|
| String source | Replace chain, target stays alive | Same — no change |
| Ref source | Replace chain, global sub, **keep target** | Replace chain, global sub, **delete target** |
| New refs to target after REPLACE | Follow the redirect (code → code2) | Dead ref → `""` |

The delete was added to prevent circular references. Without it, a user could create a cycle like `result → code → code2 → result` that would hit the recursion limit. With delete, new `ADD result code` creates a dead ref to a deleted variable.

---

## Summary

| Operation | String source | Reference source (exists) | Reference source (doesn't exist) |
|-----------|--------------|--------------------------|----------------------------------|
| **ADD** | Append `{value: str}` | Copy source's chain items | Store `{ref: source}` (forward ref) |
| **REPLACE** | Replace chain with `{value: str}`. No global sub. Keep target alive. | Replace chain with `{ref: source}`. Global sub. **Delete target**. | Replace chain with `{ref: source}`. Global sub. **Delete target**. Ref resolves to `""` at output time. |

### Key principles

1. **ADD copies chains, REPLACE redirects refs.** ADD gives you a snapshot with forward refs preserved. REPLACE with a ref source actively rewrites existing refs everywhere.

2. **Replaced ref targets become dead.** After `REPLACE code code2`, any new `ADD result code` creates a dead ref. The redirect only applies to chains that existed before the REPLACE — run-time, not compile-time.

3. **txts.OUTPUT resolves immediately.** The output buffer is the only place where values are resolved at `ADD` time, not at output time.

4. **Forward refs are always safe.** Any `{ref: x}` where `x` doesn't exist yet resolves to `""` at output time. No runtime errors for undefined variables.
