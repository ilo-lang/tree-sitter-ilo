; tree-sitter-ilo: syntax highlights
;
; Maps AST nodes to standard tree-sitter highlight groups. Editors
; (Neovim, Helix, Zed) consume these capture names directly.

; -------------------- comments / literals --------------------

(comment) @comment

(string) @string
(escape_sequence) @string.escape
(number) @number
(boolean) @boolean
(nil) @constant.builtin

; -------------------- types --------------------

(primitive_type) @type.builtin
(type_constructor) @type.builtin
(sum_keyword) @type.builtin
(function_keyword) @type.builtin
(type_ref) @type
(type_ref_name) @type

(parameter
  name: (identifier) @variable.parameter
  type: (_) @type)

(record_field
  name: (identifier) @property
  type: (_) @type)

; -------------------- declarations --------------------

(function_declaration
  name: (identifier) @function)

(tool_declaration
  name: (identifier) @function.method)

(type_declaration
  name: (identifier) @type.definition)

(use_declaration) @keyword.import

; keyword literals
"use" @keyword.import
"tool" @keyword
"type" @keyword
"ret" @keyword.return
"brk" @keyword
"wh" @keyword.repeat
"with" @keyword
"timeout" @attribute
"retry" @attribute

(continue_statement) @keyword

; the return arrow `>` in declaration position
(return_arrow) @operator

; -------------------- statements --------------------

(assignment
  name: (identifier) @variable)

(foreach_loop
  var: (identifier) @variable)

; -------------------- sigils --------------------

(sigil) @operator
(wildcard) @variable.builtin

; -------------------- field access --------------------

(field_access
  (field_name) @property)

; -------------------- calls --------------------
;
; In ilo a "call" is `<ident> <args>` written as a flat token
; sequence. We can't always tell at parse time whether an
; identifier is a call head or a bare reference, but the
; heuristic "first identifier of a statement / expression" is
; right often enough for highlighting.

((expression
  (identifier) @function.call)
 (#match? @function.call "^[a-z]"))

; -------------------- builtin names --------------------
;
; Highlight known builtin names as @function.builtin so they
; stand out from user code. Generated from the reserved short-
; name list in ai.txt.

((identifier) @function.builtin
 (#any-of? @function.builtin
   "at" "hd" "tl" "rd" "wr" "ct"
   "abs" "avg" "cap" "cat" "cel" "chr" "cos" "det" "dot"
   "env" "exp" "fft" "fld" "flr" "flt" "fmt" "frq" "get"
   "grp" "has" "inv" "len" "log" "lst" "lwr" "map" "max"
   "min" "mod" "now" "num" "ord" "pow" "rdb" "rdl" "rev"
   "rgx" "rng" "rnd" "rou" "sin" "slc" "spl" "srt" "str"
   "sum" "tan" "trm" "unq" "upr" "wrl" "zip"
   "acos" "asin" "atan" "flat" "take" "drop"
   "mget" "mset" "mmap" "mhas" "mkeys" "mvals" "mdel"
   "prnt" "mapr" "solve" "clamp" "cumsum" "median"
   "matmul" "range" "window" "chunks"
   "jdmp" "jpar" "jpth" "rdjl"))

; -------------------- punctuation --------------------

[
 "("
 ")"
 "["
 "]"
 "{"
 "}"
] @punctuation.bracket

[
 ","
 ";"
 ":"
 "."
 ".."
] @punctuation.delimiter
