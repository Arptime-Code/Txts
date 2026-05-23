# Contributing to Txts

Thanks for your interest in contributing to Txts! 🎉

> **A note from the maintainer:** I'm fairly new to working with GitHub and external contributions, so if you know more about how to improve this process or spot something that could be done better, please [open an issue](https://github.com/Arptime-Code/Txts/issues/new) or [start a discussion](https://github.com/Arptime-Code/Txts/discussions) about it. Your guidance to make the contribution experience smoother for everyone is very welcome!

This guide covers how to report issues, suggest features, and submit code changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Code Changes](#submitting-code-changes)
- [Branch Structure](#branch-structure)
- [Development Workflow](#development-workflow)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Commit Conventions](#commit-conventions)
- [Code Style](#code-style)
- [Pull Request Checklist](#pull-request-checklist)

---

## Code of Conduct

Be respectful, constructive, and inclusive. We're all here to make Txts better.

---

## How to Contribute

### Reporting Bugs

Open a [Bug Report](https://github.com/Arptime-Code/Txts/issues/new?template=bug_report.txt) on GitHub Issues. Include:

- What you expected to happen
- What actually happened
- A minimal `.txts` file that reproduces the issue
- Your environment (OS, Node.js version, Txts version)
- Any error output

### Suggesting Features

Open a [Feature Request](https://github.com/Arptime-Code/Txts/issues/new?template=feature_request.txt) on GitHub Issues. Include:

- What problem you're trying to solve
- How you imagine the feature working
- Any alternative approaches you've considered
- Example `.txts` code showing how you'd use the feature

### Submitting Code Changes

1. Pick an issue to work on (or create one first)
2. Discuss your approach in the issue comments
3. Follow the [Development Workflow](#development-workflow) below
4. Open a pull request against `dev`

---

## Branch Structure

Txts uses a three-level branching model:

```
main              # Stable, release-ready
  └── dev         # General development (integration branch)
      ├── feat/*  # Feature subbranches (one per feature)
      └── fix/*   # Bugfix subbranches (one per fix)
```

| Branch | Purpose | Base |
|--------|---------|------|
| `main` | Latest stable release. Do not commit directly. | — |
| `dev` | Active development. PRs merge here. | `main` |
| `feat/<name>` | New features (e.g., `feat/std-lib`) | `dev` |
| `fix/<name>` | Bug fixes (e.g., `fix/import-crash`) | `dev` |

---

## Development Workflow

### Starting a new feature or fix

```bash
# 1. Make sure dev is up to date
git checkout dev
git pull

# 2. Create a feature/fix branch
git checkout -b feat/my-feature    # for new features
# or
git checkout -b fix/my-bug-fix     # for bug fixes

# 3. Work, commit, repeat
git add -A
git commit -m "feat: add my feature"
```

### Opening a pull request

1. Push your branch to GitHub:

```bash
git push -u origin feat/my-feature
```

2. Go to GitHub and open a **Pull Request**
   - **Base:** `dev` ← **Compare:** `feat/my-feature`
   - Write a clear description referencing any related issues
   - Ensure tests pass

3. Wait for review
   - At least one approval is required
   - Address any feedback

4. Merge
   - Use **Squash and merge** (keeps history clean)
   - Delete the feature branch after merging

### Syncing with dev

```bash
git checkout dev
git pull
git checkout feat/my-feature
git merge dev
```

---

## Setup

```bash
# Clone the repository
git clone https://github.com/Arptime-Code/Txts.git
cd Txts

# Run from source
node bin/txts path/to/file.txts
```

No build step or `npm install` required — Txts runs directly with Node.js.

---

## Running Tests

```bash
# Run all tests
node testing/run-tests.js

# Or run individual test files
node bin/txts testing/suite/test_import.txts
node bin/txts testing/suite/test_call.txts
```

Make sure all tests pass before opening a pull request.

---

## Commit Conventions

Use [conventional commits](https://www.conventionalcommits.org/):

```
<type>: <brief description>
```

| Type     | When to use                    |
|----------|--------------------------------|
| `feat`   | A new feature                  |
| `fix`    | A bug fix                      |
| `docs`   | Documentation changes          |
| `refactor` | Code refactoring (no behavior change) |
| `test`   | Adding or updating tests       |
| `chore`  | Build, CI, tooling, packaging  |
| `style`  | Formatting, whitespace (no logic change) |

**Examples:**

```
feat: add --version flag to CLI
fix: crash on empty .txts files
docs: add FAQ page
test: add edge case tests for parser
```

---

## Code Style

- **Language:** ES5 JavaScript (no arrow functions, `let`/`const`, template literals, or other ES6+ features)
- **Indentation:** 2 spaces
- **Semicolons:** Required
- **Variable declaration:** `var` only
- **Naming:** `camelCase` for variables and functions, `UPPER_CASE` for constants
- **Error handling:** Return error objects with `.message` property

When in doubt, follow the style of the existing code in `general/`.

---

## Pull Request Checklist

Before submitting your PR:

- [ ] Tests pass (`node testing/run-tests.js`)
- [ ] New code follows the existing code style
- [ ] Commit messages follow the convention
- [ ] PR targets `dev` (not `main`)
- [ ] PR description explains what was changed and why
- [ ] If adding a feature, consider adding a test

---

## Questions?

Open a [Discussion](https://github.com/Arptime-Code/Txts/discussions) on GitHub.
