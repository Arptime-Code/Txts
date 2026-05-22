# txts

A minimalist programming language where folders are libraries and files are functions.

## Commands

- `txts <file.txts> [output.txt]` — Run a txts program
- `txts extension install <name>` — Install an extension
- `txts extension <name>` — Run an extension

## Extensions

- `txtspm` — Package manager for txts projects

## Language

### Keywords

- `IMPORT library_name` — Import a library (folder) of functions
- `CALL library_name.function_name` — Execute a function file
- `VARIABLE library.variable "value"` — Assign a variable with a string
- `VARIABLE library.variable library.other_variable` — Assign a variable from another variable
- Lines not starting with a keyword are treated as comments
