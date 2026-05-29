# Installation Guide

## Prerequisites

txts requires **Node.js v12 or later**. To check your version:

```
node --version
```

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/) or use your system's package manager:

```
# Debian / Ubuntu
sudo apt install nodejs

# macOS (Homebrew)
brew install node

# Arch Linux
sudo pacman -S nodejs npm
```

## Install via npm (when published)

Once txts is published to npm, install it globally:

```
npm install -g txts
```

After global installation, you'll be able to run txts from anywhere:

```
txts myfile.txts
```

### Install as a Project Dependency

You can also install it locally in your project:

```
cd my-project
npm install txts
```

Then use npx or a package script to run it:

```
npx txts myfile.txts
```

## Verifying Your Installation

To verify everything is working, create a test file and run it:

```txts
# hello.txts
IMPORT txts
ADD txts.OUTPUT "Hello from txts!"
```

```
txts hello.txts
```

You should see:

```
Hello from txts!
```

## Updating

If installed via npm:

```
npm update -g txts
```

## Troubleshooting

### "node: command not found"

Node.js is not installed. See the [Prerequisites](#prerequisites) section above.

### "txts: command not found"

txts is not installed globally. Run `npm install -g txts` first.

### "Permission denied" when installing globally

On Linux/macOS, you may need to use `sudo` for global npm installs:

```
sudo npm install -g txts
```

Alternatively, [configure npm](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) to use a local prefix.
