; tree-sitter-ilo: indentation rules
;
; Indent after open braces, parens, brackets. Outdent on the
; matching closer. Editors that consume tree-sitter indent
; queries (Neovim, Helix) use these to auto-indent.

[
  (brace_block)
  (paren_group)
  (list_literal)
  (body)
] @indent.begin

[
  "}"
  ")"
  "]"
] @indent.end

; Top-level declarations don't carry an indent on their
; continuation lines unless they're inside a brace_block.
(function_declaration) @indent.zero
(tool_declaration) @indent.zero
(type_declaration) @indent.zero
(use_declaration) @indent.zero
