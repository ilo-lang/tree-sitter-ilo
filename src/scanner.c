/*
 * External scanner for tree-sitter-ilo.
 *
 * Emits one custom token:
 *
 *   `_decl_terminator` — a blank line (at least one newline followed
 *   by whitespace that includes another newline, or EOF). The
 *   grammar uses this token to end a function body so the next
 *   top-level declaration starts cleanly.
 *
 * All other whitespace is handled by the grammar's `extras` rule.
 */

#include "tree_sitter/parser.h"

enum TokenType {
    DECL_TERMINATOR,
    STMT_SEP,
};

void *tree_sitter_ilo_external_scanner_create(void) { return NULL; }
void tree_sitter_ilo_external_scanner_destroy(void *p) { (void)p; }
unsigned tree_sitter_ilo_external_scanner_serialize(void *p, char *b) { (void)p; (void)b; return 0; }
void tree_sitter_ilo_external_scanner_deserialize(void *p, const char *b, unsigned n) { (void)p; (void)b; (void)n; }

bool tree_sitter_ilo_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    (void)payload;
    if (!valid_symbols[DECL_TERMINATOR] && !valid_symbols[STMT_SEP]) return false;

    // Skip horizontal whitespace, then require a newline.
    while (lexer->lookahead == ' ' || lexer->lookahead == '\t' ||
           lexer->lookahead == '\r') {
        lexer->advance(lexer, true);
    }
    if (lexer->lookahead != '\n') return false;
    lexer->advance(lexer, true);

    // Skip subsequent newlines, comments, and horizontal whitespace
    // until we find the start of a real token. Track the column of
    // that next token: column 0 means a new top-level declaration
    // (emit decl_terminator); >0 means an indented continuation of
    // the current body (emit stmt_sep).
    int next_col = 0;
    while (true) {
        int32_t c = lexer->lookahead;
        if (c == '\n') {
            next_col = 0;
            lexer->advance(lexer, true);
            continue;
        }
        if (c == ' ' || c == '\t') {
            next_col++;
            lexer->advance(lexer, true);
            continue;
        }
        if (c == '\r') {
            lexer->advance(lexer, true);
            continue;
        }
        // Comment line — eat it and continue scanning. Comments
        // don't change the indentation signal, since the next real
        // line's column is what tells us decl-vs-stmt.
        if (c == '-') {
            lexer->advance(lexer, true);
            if (lexer->lookahead == '-') {
                while (lexer->lookahead != '\n' && lexer->lookahead != 0) {
                    lexer->advance(lexer, true);
                }
                continue;
            }
            // Lone `-` (unary negate / minus) at column 0 — a new
            // decl. We've already consumed the first `-` so we can't
            // back up; fall through emitting decl_terminator with
            // the position before the `-`. Since we used a non-
            // marking advance for comments only, we need mark_end
            // here. Tree-sitter's lexer maintains its own position;
            // we use the column tracked so far.
            next_col = 0;
            break;
        }
        if (c == 0) {
            // EOF — treat as decl terminator.
            if (valid_symbols[DECL_TERMINATOR]) {
                lexer->result_symbol = DECL_TERMINATOR;
                return true;
            }
            return false;
        }
        break;
    }

    if (next_col == 0) {
        if (valid_symbols[DECL_TERMINATOR]) {
            lexer->result_symbol = DECL_TERMINATOR;
            return true;
        }
        // Column-0 token but parser only wants stmt_sep — fail so
        // tree-sitter falls back to error recovery / extras.
        return false;
    }

    if (valid_symbols[STMT_SEP]) {
        lexer->result_symbol = STMT_SEP;
        return true;
    }
    if (valid_symbols[DECL_TERMINATOR]) {
        lexer->result_symbol = DECL_TERMINATOR;
        return true;
    }
    return false;
}
