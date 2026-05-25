# AI Disclosure

This document describes how artificial intelligence was used in the creation of the txts language.

---

## How AI was used

- **Implementation** — The majority of the codebase (parser, executor, resolver, CLI, builtins, package manager, extensions, REPL, documentation, and tests) was written by TUI AI Agents through natural language conversations.
- **Design assistance** — The overall syntax, structure, and goals of the language were designed by a human, first on paper. AI was used to realize that vision, and to suggest and add useful safeties, edge case handling, and other details a human may have overlooked.
- **Documentation** — All HTML documentation pages and this disclosure were generated with AI assistance.
- **Testing** — Test files and the test runner were written by AI, but reviewed by a human to catch mistakes and to make sure the tests actually test what they are supposed to test.

## The human role

- **Concept & direction** — The core idea of txts (a text assembler and manager with only 3 commands, library-based structure, no logic or computation in the language) was conceived and designed by a human. All major design decisions were made by a human.
- **Review & refinement** — A human reviewed all output, caught issues, and steered the language direction through iterative feedback during development.

A note on future plans: I intend to manually review all AI-generated code, rewrite parts I disagree with, and eventually recreate (parts of) the project using txts itself — both as a quality check and as a way to dogfood the language.

## AI tools used

TUI AI Agents (terminal-based user interface AI agents).

## Community & contributions

As long as this remains a fairly small project, no AI will communicate directly with the community. All community interaction will be handled by a human.

Contributors are welcome to use AI to help with contributions, although I would appreciate no AI spam. Thank you.
