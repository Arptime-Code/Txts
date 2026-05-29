# Variables & OUTPUT

txts has two commands for working with variables: `ADD` and `REPLACE`. Every variable is globally visible, and every variable stores a **chain** of items — string literals and lazy references — that are resolved when read.

## ADD — Append to a Variable's Chain

`ADD` appends an **item** to a variable's chain. Each call adds one more piece to the chain. Items can be either:

- **String literals** — `ADD lib.var "hello"` stores the string directly
- **Variable references** — `ADD lib.var lib.other` stores a lazy reference to `lib.other`

```txts
IMPORT txts
ADD txts.OUTPUT "Hello, "
ADD txts.OUTPUT "world!"
```

Each `ADD` call **appends** to the variable's chain. When read, the chain resolves to `"Hello, world!"`.

## Lazy Resolution of Variable References

When you assign a **variable reference** (not a string literal) to an ADD variable, txts stores a **lazy reference** that is only resolved when the variable is *read*. This means the value reflects the **current** state at read time:

```txts
IMPORT txts
IMPORT lib

ADD lib.template "Hello, "
ADD lib.template lib.name
ADD lib.template "!"

ADD lib.name "World"
ADD txts.OUTPUT lib.template  # resolves: "Hello, World!"
```

If `lib.name` were changed later, reading `lib.template` again would pick up the new value — the reference is resolved lazily at read time.

> [!TIP]
> **Key idea:** `ADD` with a variable reference stores *how to get the value*, not the value itself. Resolution happens at read time.

## REPLACE — Three Forms

`REPLACE` has three different forms depending on what arguments you give it:

### 1. REPLACE lib.var — Freeze the Chain

With no source, `REPLACE` resolves the variable's entire chain **right now** and stores the result as a plain string. After this, the variable is frozen — it no longer updates when its dependencies change:

```txts
IMPORT txts
IMPORT lib

ADD lib.result "Hello, "
ADD lib.result lib.name
ADD lib.name "World"

REPLACE lib.result              # freezes to "Hello, World!"
ADD lib.name "Universe"
ADD txts.OUTPUT lib.result  # still "Hello, World!" (frozen)
```

### 2. REPLACE lib.var "text" — Replace All Refs with a String

With a string source, `REPLACE` finds every lazy reference item in the target's chain and replaces it with the given string. String literal items (from `ADD lib.var "text"`) are left untouched:

```txts
IMPORT txts
IMPORT lib

ADD lib.msg "Prefix: "
ADD lib.msg lib.name
ADD lib.msg " suffix"

REPLACE lib.msg "[placeholder]"  # replaces the ref to lib.name
ADD txts.OUTPUT lib.msg       # "Prefix: [placeholder] suffix"
```

### 3. REPLACE lib.var lib.ref — Replace Specific Refs with the Resolved Value

With a variable reference as source, `REPLACE` finds only the ref items in the target's chain that point to that specific variable and replaces them with the **resolved value** of that variable at this moment. Other refs are left alone:

```txts
IMPORT txts
IMPORT lib

ADD lib.template "Name: "
ADD lib.template lib.username
ADD lib.template ", Age: "
ADD lib.template lib.age

ADD lib.username "Alice"
ADD lib.age "30"

REPLACE lib.template lib.username  # replaces only the username ref with "Alice"
ADD lib.username "Bob"
ADD txts.OUTPUT lib.template  # "Name: Alice, Age: 30" (username frozen, age still lazy)
```

## The OUTPUT Variable

`txts.OUTPUT` is the designated output channel. Whatever value is in it at the end of your program is printed to stdout (or written to a file).

```txts
IMPORT txts
ADD txts.OUTPUT "This gets printed"
```

## Clearing a Variable with CLEAR

The built-in `txts.CLEAR` variable resets a variable's chain to empty when used as the source in an `ADD` command:

```txts
IMPORT txts
IMPORT suite
ADD suite.secret "This will disappear"
ADD suite.secret txts.CLEAR
ADD txts.OUTPUT suite.secret
```

After clearing, `suite.secret` is empty. The program would output nothing.

> [!TIP]
> **Append, not overwrite:** `ADD` always **appends** to the variable's chain. If you write `ADD txts.OUTPUT "Hello "` and then `ADD txts.OUTPUT "World"`, the chain has two items and resolves to `"Hello World"`.

## Variable Rules

- Variable names are case-sensitive
- Variables are always namespaced to a library (use dot notation)
- `ADD` always **appends** — the source is added as an item to the variable's chain
- The only exception is `txts.CLEAR`, which resets the chain to empty
- You can only assign to variables in libraries you have imported
- The `txts` library is **read-only** except for `txts.OUTPUT`
- `REPLACE lib.var` freezes a chain into a static string
- `REPLACE lib.var "text"` replaces all ref items with the string
- `REPLACE lib.var lib.ref` replaces matching ref items with the resolved value

## Creating Variables in Your Own Library

```txts
IMPORT myproject
IMPORT txts
ADD myproject.temp "temporary value"
ADD txts.OUTPUT myproject.temp
```

## Value Sources

| Type | Example | Description | ADD Behavior | REPLACE Behavior |
|------|---------|-------------|--------------|------------------|
| String literal | `"hello"` | A double-quoted string value | Stored as a value item in the chain | Replaces all ref items with this string |
| Variable reference | `lib.greeting` | Read from another variable in an imported library | Stored as a **lazy reference** — resolved when read | Replaces matching ref items with the resolved value **now** |
| txts.CLEAR | `txts.CLEAR` | Special sentinel to reset a variable | Resets the target chain to empty | N/A |

> [!WARNING]
> **Beware of circular references:** If a variable references itself (directly or through a chain), txts detects this after a maximum reference depth of 20 and throws an error.
