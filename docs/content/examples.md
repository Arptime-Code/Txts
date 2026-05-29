# Examples

Complete working examples that demonstrate txts concepts end-to-end.

## Example 1: Hello World

The simplest possible txts program:

```txts
# hello.txts
# Simple output program
IMPORT txts
ADD txts.OUTPUT "Hello, world!"
```

**Output:** `Hello, world!`
**Run:** `txts hello.txts`

## Example 2: Import and Read a Library Variable

This demonstrates importing a library and appending a value from it to OUTPUT.

```txts
# .local-txtspm/lib/greet.txts
IMPORT txts
IMPORT lib
ADD lib.greeting "Hello from library"
```

```txts
# main.txts
IMPORT txts
IMPORT lib
ADD txts.OUTPUT lib.greeting
```

**Output:** `Hello from library`

## Example 3: CALL a Function

Calling a function that directly sets output:

```txts
# .local-txtspm/lib/sayhello.txts
IMPORT txts
ADD txts.OUTPUT "Called function hello!"
```

```txts
# main.txts
IMPORT lib
CALL lib.sayhello
```

**Output:** `Called function hello!`

## Example 4: Chain Functions Together

A function sets a value, another reads it, and the output is built incrementally via append:

```txts
# .local-txtspm/lib/combine.txts
IMPORT txts
IMPORT lib
ADD lib.combined "Howdy"
```

```txts
# main.txts
IMPORT txts
IMPORT lib
IMPORT suite
ADD suite.result lib.combined
ADD txts.OUTPUT suite.result
```

**Output:** `Howdy`

## Example 5: Clear a Variable

Using `txts.CLEAR` to reset a variable to empty. Note: `txts.CLEAR` is the only case where `ADD` **overwrites** rather than appends:

```txts
IMPORT txts
IMPORT suite
ADD suite.secret "This should disappear"
ADD suite.secret txts.CLEAR
ADD txts.OUTPUT suite.secret
```

**Output:** (empty string — nothing printed)

## Example 6: Using External Libraries

Reading from an imported library and appending to OUTPUT:

```txts
# .local-txtspm/external/hello.txts
IMPORT txts
IMPORT external
ADD external.greeting "Hello from external library"
```

```txts
# main.txts
IMPORT txts
IMPORT external
ADD txts.OUTPUT external.greeting
```

**Output:** `Hello from external library`

## Example 7: External CALL

Calling a function from an imported external library:

```txts
# .local-txtspm/external/goodbye.txts
IMPORT txts
ADD txts.OUTPUT "Hello from goodbye function"
```

```txts
# main.txts
IMPORT external
CALL external.goodbye
```

**Output:** `Hello from goodbye function`

## Example 8: Test Suite Convention

A complete test file showing the recommended pattern:

```txts
# testing/suite/test_example.txts
# Test: verify lib.greeting is set correctly
IMPORT suite
IMPORT txts
IMPORT lib
# Call the function to set the value
CALL lib.greet
# Read the value and output it
ADD suite.result lib.greeting
ADD txts.OUTPUT suite.result
```

## Running the Examples

To run any example, make sure you have Node.js installed and the txts interpreter at hand. Navigate to your project directory and run:

```
txts yourfile.txts
```

To save output to a file instead of stdout:

```
txts yourfile.txts output.txt
```

Or use CLI flags to see version and help info:

```
txts --version
txts --help
```
