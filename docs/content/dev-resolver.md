# Resolver (general/resolver.js)

The resolver handles filesystem navigation for finding libraries and functions. It maps logical names (`lib`, `external`) to filesystem paths.

## Project Root Discovery

`findProjectRoot(startPath)` is intentionally simple:

```
function findProjectRoot(startPath) {
  return path.resolve(startPath);
}
```

It just resolves the starting path to an absolute path. No walking up, no config file lookup. The project root is simply the directory containing the `.txts` file being run (or `process.cwd()` for extensions).

> **Note:** Previously this function walked up looking for `package.json` or `.local-txtspm/`. Now it's a direct resolve — no config files required.

## Library Resolution

`resolveLibraryPath(libraryName, projectRoot)` checks for a matching directory:

```
projectRoot + '/.local-txtspm/' + libraryName
```

If the directory exists, it returns the path. Otherwise `null`.

## Function Resolution

`resolveFunctionPath(libraryName, functionName, projectRoot)` resolves a specific function file:

```
libraryPath + '/' + functionName + '.txts'
```

For example, `CALL lib.sayhello` looks for `.local-txtspm/lib/sayhello.txts`.

Returns the full file path if it exists, or `null` if the file doesn't exist.

## Library Function Listing

| Function | Description |
|----------|-------------|
| `getLibraryFunctions(libraryPath)` | Returns function names (without `.txts`) in a library directory |
| `getLibraryFunctionPaths(libraryPath)` | Returns full file paths of all `.txts` files in a library directory |

Both use `helpers.listTxtsFiles*` under the hood. Currently these are not used during execution (since `IMPORT` no longer auto-executes files), but they remain available for the txtspm extension and future use.

## Self-Import Detection

`isSelfImport(libraryName, projectRoot)` checks if the library name matches the project's directory name:

```
return libraryName === path.basename(projectRoot);
```

This was used for the old "suite" convention where a project could import itself. Currently retained for compatibility.

---

<div class="pager">
  <a href="#dev-parser">&laquo; Parser</a>
  <a href="#dev-builtins" class="next">Next: Builtins &raquo;</a>
</div>
