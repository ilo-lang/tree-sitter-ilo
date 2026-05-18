/**
 * tree-sitter grammar for ilo
 *
 * ilo is a token-optimised programming language for AI agents.
 * Source of truth: ilo/SPEC.md, ilo/ai.txt in the main ilo repo.
 *
 * Design
 * ------
 *
 * ilo's sigil-heavy syntax overloads tokens across positions:
 * `?` is ternary, match and bare-bool prefix-ternary; `>` is
 * return-arrow and binary greater-than; `!` is logical-not,
 * negation and auto-unwrap suffix; `=` is bind and equality.
 * The ilo engine itself disambiguates by context — full
 * grammatical disambiguation in tree-sitter would require a
 * lot of conflicts.
 *
 * For editor support we don't need a fully disambiguated AST.
 * We need:
 *   1. recognise top-level declarations (fn / type / tool / use)
 *   2. tokenise identifiers, literals, sigils, comments
 *   3. group the common structured shapes (assign, loop, return)
 *      so indenting and folding work
 *
 * Inside a body, statements are token sequences separated by
 * `;` or newline. Structured shapes — `wh c {body}`, `@v
 * iter{body}`, `name=value`, `ret expr` — get their own nodes
 * for highlighting and indentation queries. Everything else is
 * an `expression` which is a flat token sequence. Queries in
 * `queries/highlights.scm` use anchor predicates on token kinds
 * (`identifier`, sigils, keywords) to colour the contents.
 */

module.exports = grammar({
  name: 'ilo',

  extras: $ => [
    /[ \t\r\n]/,
    $.comment,
  ],

  externals: $ => [
    $._decl_terminator,
    $._stmt_sep,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.body],
    [$.source_file],
    [$.function_declaration, $.statement],
    [$.parameter, $.expression],
    [$.parameter, $.statement],
    [$.assignment, $.expression],
    [$.foreach_loop, $.expression],
    [$.while_loop, $.expression],
    [$.destructure_assignment, $.brace_block],
    [$.destructure_assignment, $.body],
    [$.type_expr],
    [$.param_type_expr, $.parameter],
    [$.param_type_expr],
    [$.param_type_expr, $.function_declaration],
    [$._type_atom],
    [$.return_arrow, $.sigil],
    [$.lambda, $.paren_group],
    [$.parameter, $._token],
    [$.lambda, $.expression],
    [$.lambda, $._token],
  ],

  rules: {
    source_file: $ => repeat(seq($._top_item, optional($._decl_terminator))),

    _top_item: $ => choice(
      $.use_declaration,
      $.tool_declaration,
      $.type_declaration,
      $.function_declaration,
      $.statement,
    ),

    // -------------------- comments --------------------

    comment: $ => token(seq('--', /[^\n]*/)),

    // -------------------- declarations --------------------

    use_declaration: $ => prec.right(seq(
      'use',
      $.string,
      optional(seq('[', repeat($.identifier), ']')),
    )),

    tool_declaration: $ => prec.right(seq(
      'tool',
      field('name', $.identifier),
      field('description', $.string),
      repeat($.parameter),
      $.return_arrow,
      field('return_type', $.param_type_expr),
      repeat($.tool_option),
    )),

    tool_option: $ => prec.right(seq(
      choice('timeout', 'retry'),
      ':',
      $.number,
      optional(','),
    )),

    type_declaration: $ => prec.right(seq(
      'type',
      field('name', $.identifier),
      choice(
        seq('{', sepBy(';', $.record_field), '}'),
        seq('=', $.param_type_expr),
      ),
    )),

    record_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $.param_type_expr),
    ),

    function_declaration: $ => prec.dynamic(100, prec.right(20, seq(
      field('name', $.identifier),
      repeat($.parameter),
      $.return_arrow,
      field('return_type', $.param_type_expr),
      optional(';'),
      field('body', $.body),
    ))),

    parameter: $ => prec.dynamic(5, seq(
      field('name', $.identifier),
      ':',
      field('type', $.param_type_expr),
    )),

    // Parameter type: starts with one type atom; if the leading atom
    // is a parameterised constructor (L, O, M, R, F) it consumes its
    // expected arity of arguments. Bare primitive types and bare type
    // refs are single-atom — which is what avoids gobbling the next
    // parameter's name.
    param_type_expr: $ => choice(
      $.primitive_type,
      $.type_ref,
      $.parenthesised_type,
      $.list_param_type,
      $.opt_param_type,
      $.map_param_type,
      $.result_param_type,
      $.fn_param_type,
      $.sum_keyword_type,
    ),

    list_param_type: $ => prec.right(seq('L', $.param_type_expr)),
    opt_param_type: $ => prec.right(seq('O', $.param_type_expr)),
    map_param_type: $ => prec.right(seq('M', $.param_type_expr, $.param_type_expr)),
    result_param_type: $ => prec.right(seq('R', $.param_type_expr, $.param_type_expr)),
    fn_param_type: $ => prec.right(seq('F', $.param_type_expr, $.param_type_expr)),
    sum_keyword_type: $ => prec.right(seq('S', repeat1($.identifier))),

    // `>` in declaration position is the return arrow. We use an
    // alias so highlight queries can colour it as a keyword
    // distinct from greater-than.
    return_arrow: $ => '>',

    body: $ => prec.right(seq(
      $.statement,
      repeat(seq(choice(';', $._stmt_sep), $.statement)),
      optional(choice(';', $._stmt_sep)),
    )),

    // -------------------- types --------------------

    type_expr: $ => prec.right(repeat1($._type_atom)),

    _type_atom: $ => choice(
      $.primitive_type,
      $.type_constructor,
      $.sum_keyword,
      $.function_keyword,
      $.type_ref,
      $.parenthesised_type,
    ),

    primitive_type: $ => choice('n', 't', 'b', '_'),
    type_constructor: $ => choice('L', 'O', 'M', 'R'),
    sum_keyword: $ => 'S',
    function_keyword: $ => 'F',
    type_ref: $ => alias($.identifier, $.type_ref_name),
    parenthesised_type: $ => seq('(', $.type_expr, ')'),

    // -------------------- statements --------------------

    statement: $ => choice(
      $.assignment,
      $.destructure_assignment,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.foreach_loop,
      $.while_loop,
      $.expression,
    ),

    assignment: $ => prec.right(4, seq(
      field('name', $.identifier),
      '=',
      field('value', $.expression),
    )),

    destructure_assignment: $ => prec(6, seq(
      '{',
      sepBy1(';', $.identifier),
      '}',
      '=',
      field('value', $.expression),
    )),

    return_statement: $ => prec.right(seq('ret', optional($.expression))),
    break_statement: $ => prec.right(seq('brk', optional($.expression))),
    continue_statement: $ => 'cnt',

    foreach_loop: $ => prec(5, seq(
      '@',
      field('var', $.identifier),
      field('iterable', $.iter_target),
      $.brace_block,
    )),

    // foreach iterable / range bounds: any sequence of non-brace
    // tokens. The trailing brace_block terminates the iterable.
    iter_target: $ => prec.right(repeat1($._iter_token)),

    _iter_token: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.nil,
      $.field_access,
      $.list_literal,
      $.paren_group,
      $.wildcard,
      '+', '-', '*', '/',
      '==', '!=', '>=', '<=', '=', '>', '<',
      '&', '|', '!', '..',
    ),

    while_loop: $ => seq(
      'wh',
      field('condition', $.iter_target),
      $.brace_block,
    ),

    // -------------------- expressions --------------------

    expression: $ => prec.right(repeat1($._token)),

    _token: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.nil,
      $.field_access,
      $.identifier,
      $.wildcard,
      $.list_literal,
      $.brace_block,
      $.paren_group,
      $.sigil,
    ),

    wildcard: $ => '_',

    sigil: $ => choice(
      '+', '-', '*', '/', '+=',
      '==', '!=', '>=', '<=',
      '=', '>', '<',
      '&', '|',
      '!!', '!',
      '??', '>>',
      '?', '^', '~', '@',
      ',', ':', '..', '.',
      'with',
    ),

    field_access: $ => prec.left(20, seq(
      choice($.identifier, $.field_access, $.paren_group),
      choice(token.immediate('.'), token.immediate('.?')),
      $.field_name,
    )),

    field_name: $ => token.immediate(/[A-Za-z_][A-Za-z0-9_]*(-[A-Za-z0-9_]+)*|[0-9]+/),

    paren_group: $ => choice(
      seq('(', optional($.expression), ')'),
      $.lambda,
    ),

    // Inline lambda: (param:type ...>ret;body)
    lambda: $ => seq(
      '(',
      repeat($.parameter),
      $.return_arrow,
      field('return_type', $.param_type_expr),
      ';',
      field('body', $.body),
      ')',
    ),

    list_literal: $ => seq('[', optional($.expression), ']'),

    brace_block: $ => seq('{', optional($.body), '}'),

    // -------------------- literals --------------------

    string: $ => seq(
      '"',
      repeat(choice(
        $.escape_sequence,
        /[^"\\]/,
      )),
      '"',
    ),

    escape_sequence: $ => token.immediate(seq(
      '\\',
      /./,
    )),

    number: $ => /-?[0-9]+(\.[0-9]+)?/,

    boolean: $ => choice('true', 'false'),

    nil: $ => 'nil',

    identifier: $ => /[a-z][a-z0-9]*(-[a-z0-9]+)*/,
  },
});

function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}

function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}
