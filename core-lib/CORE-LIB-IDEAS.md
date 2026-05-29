# Core Library Ideas

> Brainstorm for the `core-lib/` modules that ship with txts.
> Each bullet is a rough idea — mix of coding constructs, text templates, and utility helpers.

---

## Code Constructs Templates

- **core:if** — if / else if / else block templates with indentation nesting
- **core:loop** — for-loop, while-loop, do-while templates across languages
- **core:function** — function/method definition templates (name, params, body, return)
- **core:class** — class/struct/object definition templates (constructor, fields, methods)
- **core:import** — import/require/include/include_once templates per language
- **core:export** — export/module.exports/default export templates
- **core:array** — array/list/vector literal + initialization templates

## Variable & Data Templates

- **core:variable** — variable declaration + assignment (let/const/var/val) — *started*
- **core:assignment** — compound assignment (+=, -=, etc.) templates

## HTML & Document Templates

- **core:html** — HTML document skeleton (doctype, head, body, meta, link, script)
- **core:email** — email template (to, subject, salutation, body, closing)
- **core:report** — report/analysis template (title, summary, sections, conclusion)
- **core:blog** — blog post template (title, meta, intro, body, outro, tags)
- **core:todo-list** — task list / checklist template with grouping
- **core:outline** — outline/table-of-contents template (hierarchical sections)

## Utility Templates

- **core:timestamp** — date/time/timestamp formatting (now, relative, custom format)

---

> **How to read the namespace:** `core:if` → `IMPORT core:if`, `CALL core:if`, etc.
> Each module defines INSTANCE variables that the caller fills in, then RESOLVEs into OUTPUT.
