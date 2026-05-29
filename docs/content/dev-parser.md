# Parser (general/parser.js)

The parser converts raw txts source text into an array of command objects that the executor can process.

## Parsing Flow

1. `parseFile(content)` splits the content by `\n` into lines
2. Each line is trimmed and passed to `parseLine`
3. `parseLine` checks the prefix to determine the command type:

```
if (line.startsWith('IMPORT '))  → parseImport
if (line.startsWith('CALL '))    → parseCall
if (line.startsWith('ADD '))     → parseAdd
if (line.startsWith('REPLACE ')) → parseReplace
else                             → comment (returns null)
```

Lines that return `null` (comments, empty lines) are excluded from the command list.

## Command Objects

### IMPORT

```
{ type: 'import', library: 'lib' }
```

The parser grabs everything after `IMPORT ` as the library name. No validation is done at parse time.

### CALL

```
{ type: 'call', library: 'lib', function: 'sayhello' }
```

The parser expects exactly one dotted reference after `CALL `. It uses `parseDottedReference` to split `lib.sayhello` into library and function name.

### ADD

```
{
  type: 'add',
  target: { library: 'txts', name: 'OUTPUT' },
  source: { type: 'string', value: 'hello' }
}
```

ADD splits the rest of the line into:

- **Target** (first token) — parsed as a dotted reference
- **Source** (remaining text) — determined by `parseSource`

### REPLACE

```
{
  type: 'replace',
  target: { library: 'lib', name: 'result' },
  sources: [ ... ]  // empty (freeze), string, or reference
}
```

REPLACE splits the rest of the line into the target (first token) and optional source (remaining text). If no source is given, the target's chain is frozen. If a source is given, it's resolved eagerly and used to replace matching items in the chain.

## Source Types

| Source Type | Example | Parsed Form |
|-------------|---------|-------------|
| String literal | `"hello"` | `{type: 'string', value: 'hello'}` |
| Variable reference | `lib.greeting` | `{type: 'reference', library: 'lib', name: 'greeting'}` |

`parseSource(text)` checks if the text starts with a quote: if yes → string (via `stripQuotes`), otherwise → dotted reference (via `parseDottedReference`).

## Key Design Details

- Empty lines and lines that don't start with a command keyword return `null` and are excluded
- CALL expects exactly one dotted reference (library.function)
- ADD splits on first space for target, then the rest is the source
- The source can only be a quoted string or a dotted reference — unquoted text that isn't dotted is an error
- No semantic validation happens at parse time — that's the executor's job

---

<div class="pager">
  <a href="#dev-helpers">&laquo; Helpers</a>
  <a href="#dev-resolver" class="next">Next: Resolver &raquo;</a>
</div>
