# Package Manager (txtspm)

txtspm is the built-in package manager for txts. It helps you share, discover, and reuse libraries across projects.

## Installation

Install the txtspm extension:

```
txts extension install txtspm
```

## Running txtspm

Once installed, run it from your project directory:

```
txts extension txtspm
```

This opens an interactive REPL with the prompt `txtspm>`.

## Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize a project: creates `README.md`, `txts-metadata.json`, and `.local-txtspm/` |
| `save` | Save your project to the global store at `~/.txtspm/` |
| `import <name>` | Import a project from the global store into your `.local-txtspm/` |
| `delete <name>` | Delete a project from the global store |
| `list` | List all saved projects in the global store |
| `search <query>` | Fuzzy-search saved projects by name, title, description, and keywords |
| `update` | Regenerate metadata and import all missing dependencies |
| `help` | Show the help message |
| `exit` | Exit txtspm |

## Workflow

### 1. Initialize a Project

```
txtspm> init
```

This creates:

- `README.md` — Empty project description file
- `txts-metadata.json` — Auto-generated metadata (Title, Description, Functions, Dependencies, etc.)
- `.local-txtspm/` — Empty libraries directory

### 2. Save to Global Store

```
txtspm> save
```

This copies your project (excluding `.local-txtspm`, `node_modules`, and `.git`) to `~/.txtspm/<project-name>/`. This makes it available for import by other projects.

### 3. Import a Library

```
txtspm> import some-library
```

This copies `~/.txtspm/some-library/` into `.local-txtspm/some-library/` in your current project. You can now `IMPORT some-library` in your code.

### 4. Update Dependencies

```
txtspm> update
```

This regenerates the project metadata and imports any dependencies that are listed in your import statements but not yet present in `.local-txtspm/`.

## Searching for Libraries

Use the `search` command to find libraries:

```
txtspm> search greet
```

This performs a fuzzy search across all saved projects, matching by name, title, description, and keywords. Results are ranked by relevance score.

## Metadata

Each project can have a `txts-metadata.json` file with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `Title` | String | Project name |
| `Description` | String | Brief description of the project |
| `Keywords` | Array | Search keywords |
| `Version` | String | Version number (`0.0.0` default) |
| `Variation` | String | Optional variant tag |
| `Functions` | Array | List of functions with names and descriptions |
| `Type` | String | `"program"` or `"library"` |
| `Dependencies` | Array | Auto-detected list of imported libraries (excluding `txts`) |

You can edit the metadata file manually to add descriptions and keywords, then run `txtspm update` to regenerate the computed fields.
