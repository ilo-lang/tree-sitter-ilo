# tree-sitter-ilo

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the [ilo programming language](https://ilo-lang.ai).

ilo is a token-optimised programming language for AI agents. Its dense prefix-and-sigil syntax is unusual, but its lexical structure is unambiguous, so this grammar gets every editor with tree-sitter support to colour ilo code correctly.

## Status

Initial release. Covers every shape that appears in the upstream `ilo/examples/` corpus (97% of 229 sample programs parse without `ERROR` nodes). The handful that don't are multi-line bodies with blank lines inside them, which the current scanner doesn't fully disambiguate from declaration boundaries; queued for the next release.

## What this enables

- **Neovim** via `nvim-treesitter` once the grammar is added to its parsers list
- **Helix** via a `[[grammar]]` block pointing at this repo in `languages.toml`
- **Zed** via native tree-sitter discovery once published to npm
- **VS Code** via tree-sitter-based extensions, alongside the existing TextMate grammar
- **GitHub** pending Linguist PR; once accepted, `.ilo` files on github.com get syntax highlighting
- **Any tree-sitter tool** ast-grep, comby, anything that walks tree-sitter ASTs

## Layout

```
grammar.js                  the grammar DSL
src/parser.c                generated parser (committed)
src/grammar.json            generated grammar metadata
src/node-types.json         generated node-types schema
src/scanner.c               external scanner (newline / decl-terminator handling)
queries/
  highlights.scm            syntax highlighting
  indents.scm               auto-indent rules
  injections.scm            nested language injections (regex)
  locals.scm                local-scope variable resolution
bindings/
  node/                     Node.js bindings for npm
  rust/                     Rust bindings for crates.io
test/corpus/                tree-sitter test fixtures
package.json                npm metadata
Cargo.toml                  crates.io metadata
binding.gyp                 node-gyp build config
```

## Build

```sh
# generate parser from grammar.js
tree-sitter generate

# run corpus tests
tree-sitter test

# parse a file
tree-sitter parse path/to/file.ilo
```

You need [tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/cli/) installed (`npm install -g tree-sitter-cli` or `cargo install tree-sitter-cli`).

## Using from Neovim (local checkout)

In your Neovim config:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.ilo = {
  install_info = {
    url = "~/path/to/ilo-tree-sitter",
    files = { "src/parser.c", "src/scanner.c" },
    branch = "main",
  },
  filetype = "ilo",
}
```

Then `:TSInstallFromGrammar ilo` and the highlight queries in `queries/` get picked up automatically when you open a `.ilo` buffer.

## Using from Helix

In your `languages.toml`:

```toml
[[language]]
name = "ilo"
scope = "source.ilo"
file-types = ["ilo"]
roots = []
comment-token = "--"
indent = { tab-width = 2, unit = "  " }

[[grammar]]
name = "ilo"
source = { git = "https://github.com/ilo-lang/ilo-tree-sitter", rev = "main" }
```

Then `hx --grammar fetch` and `hx --grammar build`.

## Grammar coverage

The grammar covers:

- **Function declarations** `name args:type ...>return-type;body`
- **Type signatures** primitive (`n`, `t`, `b`, `_`), parameterised (`L T`, `O T`, `R T E`, `M K V`, `F A R`), sum (`S a b c`), named records
- **Prefix operators** `+a b`, `*x y`, `>=x 0`, every arithmetic / comparison / boolean shape
- **Control flow** `?subj{...}`, `?subj{...}{...}` (ternary), `?{arms}` (match), `wh c{body}`, `@v xs{body}` (foreach), `@i a..b{body}` (range), `ret`, `brk`, `cnt`
- **Calls** `f a b`, `f! a b` (auto-unwrap), `f!! a b` (panic-unwrap), `f()` (zero-arg)
- **Pipes** `x>>f>>g`
- **Field access** `r.field`, `r.?optional`, chained, on parenthesised expressions
- **Records / sums** declaration and construction
- **Inline lambdas** `(x:n>n;+x 1)`
- **Use imports** `use "file.ilo" [names]`
- **Tool declarations** `tool name "desc" params>ret`
- **Literals** numbers, strings (with escape sequences), lists, maps, `true`, `false`, `nil`
- **Comments** `--` to end of line

## Versioning

Versions track ilo's grammar shape. Starts at `0.12.0` matching ilo's release line. A new minor version goes out when the grammar adds nodes (new ilo syntax); a new patch when only queries or bindings change.

## References

- Tree-sitter docs: [tree-sitter.github.io/tree-sitter](https://tree-sitter.github.io/tree-sitter/)
- The ilo language: [github.com/ilo-lang/ilo](https://github.com/ilo-lang/ilo)
- ilo specification: [github.com/ilo-lang/ilo/blob/main/SPEC.md](https://github.com/ilo-lang/ilo/blob/main/SPEC.md)

## License

MIT. Matches ilo. See `LICENSE`.
