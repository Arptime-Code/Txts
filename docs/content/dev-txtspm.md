# txtspm Extension (extensions/txtspm/)

The package manager extension is composed of three modules: `index.js` (entry point and dispatch), `metadata.js` (project metadata management), `search.js` (fuzzy search), and `operations.js` (business logic).

## index.js — Entry Point

The main entry point creates a REPL and dispatches commands based on user input:

### Key Details

- Finds project root from `process.cwd()` (not from the file being executed)
- Commands: init, save, import, delete, list, search, update, help
- Uses `repl.createRepl` for interactive input

### Command Dispatch

```
init     → operations.handleInit(projectRoot)
save     → operations.handleSave(projectRoot)
import   → operations.handleImport(name, projectRoot)
delete   → operations.handleDelete(name)
list     → (lists installed packages)
search   → search.searchAll(query)
update   → operations.handleUpdate(projectRoot)
help     → (prints usage info)
```

## metadata.js — Metadata Management

Manages `txts-metadata.json` files that describe the project's functions and dependencies:

| Function | Description |
|----------|-------------|
| `readMetadata(projectPath)` | Parses the `txts-metadata.json` file from disk |
| `writeMetadata(projectPath, metadata)` | Writes metadata object to disk as JSON |
| `generateMetadata(projectRoot)` | Scans all `.txts` files, extracts function names by calling `listTxtsFiles` on each library directory, detects dependencies by reading `IMPORT` statements, and merges with existing metadata |
| `buildFunctionsList(projectRoot, existingMetadata)` | Walks `.local-txtspm/` subdirectories, collects function names per library |
| `buildDependenciesList(projectRoot)` | Recursively scans all `.txts` files in the project, finds `IMPORT` statements, excludes `txts` and self-references |
| `findAllTxtsFilesRecursive(dirPath, projectRoot)` | Recursively finds all `.txts` files, skipping the `.local-txtspm` subdirectory |

## search.js — Fuzzy Search

Provides fuzzy search functionality across the global store (`~/.txtspm/`):

| Function | Description |
|----------|-------------|
| `fuzzySearch(query, names, metadataList)` | Searches both names and metadata, ranks by score |
| `simpleFuzzyMatch(query, text)` | Scoring: exact match (100), substring (80), character-by-character matching (up to 60) |
| `searchAll(query)` | Scans all projects in `~/.txtspm/` and applies fuzzy search |

## operations.js — Business Logic

Implements the actual operations behind each txtspm command:

| Function | Description |
|----------|-------------|
| `handleInit(projectRoot)` | Creates `README.md`, `txts-metadata.json`, and the `.local-txtspm/` directory |
| `handleSave(projectRoot)` | Copies project files to `~/.txtspm/<name>/`, excluding `.local-txtspm`, `node_modules`, `.git` |
| `handleImport(name, projectRoot)` | Copies a package from `~/.txtspm/<name>/` into `.local-txtspm/<name>/` |
| `handleDelete(name)` | Removes a project from the global `~/.txtspm/` store |
| `handleUpdate(projectRoot)` | Regenerates metadata and imports all missing dependencies |

---

<div class="pager">
  <a href="#dev-executor">&laquo; Executor</a>
  <a href="#dev-repl" class="next">Next: REPL &raquo;</a>
</div>
