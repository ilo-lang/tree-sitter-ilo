; tree-sitter-ilo: language injections
;
; Inject ilo highlighting into markdown fenced code blocks
; tagged ```ilo. Other editors / tools can opt in.

; Markdown injection — handled at the consumer side typically,
; but documented here so users know the canonical fence name.
;
; ```ilo
; add a:n b:n>n;+a b
; ```
;
; Regex strings — the `rgx` and `rgxall` builtins accept a regex
; pattern as their first text argument. Editors that want to
; highlight the regex syntax can opt in via this injection.

; Match the shape `rgx "<pattern>" <text>` inside an expression
; sequence. The first child after the rgx identifier is the
; pattern string.
((expression
   (identifier) @_fn
   (string) @injection.content)
 (#any-of? @_fn "rgx" "rgxall" "rgxsub")
 (#set! injection.language "regex"))
