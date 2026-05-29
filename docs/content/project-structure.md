# Project Structure

A well-organized txts project follows a consistent directory structure. Here's how to set up and organize your code.

## Standard Project Layout

```
my-txts-project/
  package.json               # Optional: project metadata
  .local-txtspm/             # Local libraries directory
    mylib/              # A library named "mylib"
      greet.txts       # A function: mylib.greet
      sayhello.txts    # A function: mylib.sayhello
  main.txts                  # Entry point of your program
  docs/                      # Documentation
  tests/                     # Test files
  txts-metadata.json         # Project metadata (auto-generated)
  README.md                  # Optional: project description
```

## Project Root Detection

Txts detects the project root by walking up the directory tree looking for a `.local-txtspm/` directory. If found, that directory becomes the project root. If none is found, the directory containing your `.txts` file is used instead — no configuration files are required.

The `.local-txtspm/` directory is automatically created when you run `txtspm init` or import a library.

> [!TIP]
> **No configuration needed for now:** You don't need `package.json` or any other config file to use txts today. A dedicated project configuration file is planned for a future release.

## The .local-txtspm Directory

This is where all libraries live. Each subdirectory is a library, and each `.txts` file inside is a function in that library.

| Path | Library Name | Functions |
|------|-------------|-----------|
| `.local-txtspm/lib/` | `lib` | `lib.greet`, `lib.sayhello` |
| `.local-txtspm/external/` | `external` | `external.hello`, `external.goodbye` |
| `.local-txtspm/suite/` | `suite` | `suite.setup` |

## Naming Conventions

- **Library names:** lowercase, alphanumeric (e.g., `lib`, `external`, `myproject`)
- **Function/variable names:** lowercase, camelCase, or kebab-case (e.g., `greeting`, `sayhello`, `my-value`)
- **File names:** Same as function names, with `.txts` extension
- **Use underscores or hyphens** to separate words in variable names (e.g., `my_variable`, `temp-value`)

## The Suite Convention (for Tests)

When writing test files in a `testing/suite/` directory, follow this convention:

```txts
IMPORT suite      # Import your working library first
IMPORT txts       # Import built-ins you need
IMPORT lib        # Import libraries you test with
ADD suite.result lib.greeting  # Use suite.* for your vars
```

The `suite` namespace is where you create intermediate variables. This keeps test files clean and consistent.

## File Organization Tips

- **One main entry point** — Have a single `.txts` file at the project root that ties everything together
- **Group related functions** — Put related functions in the same library directory
- **Keep libraries focused** — A library should do one thing well
- **Use comments liberally** — Every non-command line is a comment, so document as you go
- **Separate tests** — Keep test files in a `testing/` directory
