# txts Language Support for VS Code

Syntax highlighting for **.txts** files — the txts programming language.

## Features

- Highlight `IMPORT`, `CALL`, `ADD`, and `REPLACE` keywords
- Highlight string literals (`"...`)
- Highlight dotted variable references (`lib.variable`)
- Highlight built-in `txts.OUTPUT` and `txts.CLEAR` references
- Non-keyword lines highlighted as comments
- Comment toggle support (`#`)

## Installation

### From VSIX (recommended for development)

```bash
cd vscode-txts
npx vsce package
code --install-extension txts-language-0.1.0.vsix
```

### From source

Copy the `vscode-txts/` folder to `~/.vscode/extensions/txts-language/` and restart VS Code.

## Usage

Open any `.txts` file in VS Code. Syntax highlighting activates automatically.

## License

MIT
