//! Rust bindings for the tree-sitter-ilo grammar.

use tree_sitter_language::LanguageFn;

extern "C" {
    fn tree_sitter_ilo() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for the ilo grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_ilo) };

/// The content of the [`node-types.json`] file for this grammar.
pub const NODE_TYPES: &str = include_str!("../../src/node-types.json");

/// Highlights query for editor syntax highlighting.
pub const HIGHLIGHTS_QUERY: &str = include_str!("../../queries/highlights.scm");

/// Indents query for editor auto-indent.
pub const INDENTS_QUERY: &str = include_str!("../../queries/indents.scm");

/// Injection rules for nested language highlighting.
pub const INJECTIONS_QUERY: &str = include_str!("../../queries/injections.scm");

/// Local variable scope rules.
pub const LOCALS_QUERY: &str = include_str!("../../queries/locals.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading ilo grammar");
    }
}
