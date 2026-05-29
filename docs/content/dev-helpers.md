# Helpers (general/helpers.js)

The helpers module provides shared utility functions for file operations, string parsing, and path handling. It's used by most other modules.

## Constants

| Constant | Value | Usage |
|----------|-------|-------|
| `TXTS_EXTENSION` | `'.txts'` | Required file extension for txts source files |
| `QUOTED_STRING_PATTERN` | `/^"[^"]*"$/` | Regex to match double-quoted strings |

## File Operations

| Function | Description |
|----------|-------------|
| `readFile(filePath)` | Reads a file as UTF-8 text. Used by the executor to read `.txts` files. |
| `writeFile(filePath, content)` | Writes text content to a file. Used for output and metadata files. |
| `fileExists(filePath)` | Checks if a file or directory exists on disk. |
| `ensureDir(dirPath)` | Creates a directory recursively (like `mkdir -p`). |
| `removeDir(dirPath)` | Recursively removes a directory (like `rm -rf`). |
| `listTxtsFiles(dirPath)` | Lists `.txts` filenames (without extension) in a directory. |
| `listTxtsFilesFullPath(dirPath)` | Lists full paths of `.txts` files in a directory. Used by resolver to find library functions. |
| `readdirNames(dirPath)` | Lists all entry names in a directory. |
| `copyDir(src, dest)` | Recursively copies a directory. Used by txtspm save/import operations. |
| `isDirectoryEmpty(dirPath)` | Returns true if the directory has no entries. |

## String Parsing

| Function | Description |
|----------|-------------|
| `isQuotedString(str)` | Returns true if the string matches the pattern `^"[^"]*"$` |
| `stripQuotes(str)` | Removes surrounding double quotes from a string. Returns the string unchanged if not quoted. |
| `parseDottedReference(str)` | Splits `"lib.name"` into `{library: "lib", name: "name"}`. Returns `null` if no dot found. |

## Path Helpers

| Function | Description |
|----------|-------------|
| `getHomeDir()` | Returns the user's home directory (used for global extension store). |
| `getProjectName(rootPath)` | Returns the basename of the project root path. |

---

<div class="pager">
  <a href="#dev-cli">&laquo; CLI & Entry Point</a>
  <a href="#dev-parser" class="next">Next: Parser &raquo;</a>
</div>
