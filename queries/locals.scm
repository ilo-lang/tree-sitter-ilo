; tree-sitter-ilo: local scopes
;
; Scope and binding rules let editors highlight unused params,
; resolve `goto definition`, and warn on shadowing.

; Scopes
(function_declaration) @local.scope
(lambda) @local.scope
(brace_block) @local.scope
(foreach_loop) @local.scope
(while_loop) @local.scope

; Definitions
(parameter
  name: (identifier) @local.definition.parameter)

(assignment
  name: (identifier) @local.definition.var)

(foreach_loop
  var: (identifier) @local.definition.var)

(function_declaration
  name: (identifier) @local.definition.function)

; References
(expression
  (identifier) @local.reference)

(field_access
  (identifier) @local.reference)
