# corpus — the studied specification set as a store

**Role.** Loads `specifications/*.md` (volumes and the refimpl book),
indexes sections with stable anchors, and answers deterministic evidence
queries with quoted excerpts and volume/section references. Dual-use by
design: the machine reads it through resolvers (evidence, presented
sources); the site reads it directly (the reading map and spec pages).

**Governed by.** The corpus is the *subject under study* — it renders the
frozen `specifications/` tree and never modifies it.

**May import.** `nest/wave` (types only — the corpus speaks the wire
vocabulary: EvidenceExcerpt).

**Belongs here.** Corpus loading, section indexing, `anchorOf` (the shared
heading-anchor contract the site renderer must agree with), deterministic
retrieval.

**Never here.** Semantic search via inference (that is membrane work),
writes of any kind, UI.
