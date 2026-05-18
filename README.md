# tree-sitter-ilo

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the ilo programming language.

## Status

Stub. Implementation has not started. Repo exists so editor tooling can find the grammar at the canonical `tree-sitter-<lang>` location when it lands.

## What this enables

Once shipped, editors with tree-sitter support will pick up ilo grammar automatically:

- **VS Code** via tree-sitter extensions
- **Neovim** via `nvim-treesitter`
- **Helix** via its `languages.toml` registry
- **Zed** via native tree-sitter integration
- **GitHub** for syntax-highlighted ilo source in repos and gists

Until this lands, ilo source on most surfaces displays as plain text or with regex-based highlighting.

## Scope

A complete tree-sitter grammar covering:

- Function declarations and parameters
- Type sigils (`n`, `t`, `b`, `L`, `M`, `R`, `O`, `S`, `F`, `_`)
- Operators and prefix notation
- Sigils for control flow (`?`, `!`, `~`, `^`, `@`, `>`, `>>`)
- Guards and match arms
- Record types and field access
- Tool declarations
- Comments (`--`)
- Literals: numbers, strings, lists, maps

Plus standard query files for highlighting, indentation, and code folding.

## Layout (planned)

```
tree-sitter-ilo/
├── grammar.js              # the grammar definition
├── src/                    # generated parser, committed
├── queries/                # editor queries
│   ├── highlights.scm
│   ├── indents.scm
│   └── injections.scm
├── bindings/               # language bindings
│   ├── node/
│   └── rust/
└── package.json            # npm publishing
```

## References

- Tree-sitter docs: [tree-sitter.github.io/tree-sitter](https://tree-sitter.github.io/tree-sitter/)
- The ilo language: [github.com/ilo-lang/ilo](https://github.com/ilo-lang/ilo)
- ilo specification: [github.com/ilo-lang/ilo/blob/main/SPEC.md](https://github.com/ilo-lang/ilo/blob/main/SPEC.md)

## License

MIT. See `LICENSE`.
