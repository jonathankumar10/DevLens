import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A book's back-of-the-book index, but built and searched at library scale. Instead of scanning every page of every book (a full table scan) to find a word, the index tells you exactly which books and pages mention it — and a good index also tells you how central that word is to each page, so the most relevant matches surface first. At library scale, no single index fits in one binder, so the index itself is split across many binders, and finding an answer means checking all of them and merging the results.",
  howItWorks: [
    'Inverted index: instead of storing documents and scanning them for a query term, the system stores, per term, the list of documents (a "posting list") containing it. Looking up "database" returns its posting list directly — O(matching documents), not O(all documents). This is the foundational data structure of every full-text search engine.',
    'Analysis pipeline: raw text is tokenized (split into words), lowercased, stemmed (running → run), and stripped of stop words (the, is, at) before being added to the index. The same analysis pipeline runs on incoming queries, so "Databases" in a query matches "database" in the index. Choices here (which stemmer, which stop-word list, language-specific tokenizers) directly shape recall.',
    'Relevance ranking: TF-IDF scores a term by how often it appears in a document (term frequency) weighted down by how common it is across all documents (inverse document frequency) — rare, repeated terms score highest. BM25, used by modern engines, refines this with saturation (the 10th occurrence of a word barely adds more signal than the 5th) and document-length normalization, and is the standard default ranking function.',
    'Sharding the index: a single index cannot fit in memory or serve enough query throughput at scale, so it\'s split into shards, each an independent inverted index over a subset of documents (by hash or range of a document ID). A query fans out to every shard in parallel, each shard returns its local top-K matches, and a coordinator merges and re-scores the combined results into a single ranked list.',
    'Write path — near-real-time indexing: new or updated documents are appended to a shard\'s index as an immutable segment rather than mutating existing structures in place; segments are periodically merged in the background to bound their number. This is why full-text search engines are typically "near-real-time" (results visible within ~1 second) rather than instantaneous — there\'s a small refresh interval before a new segment becomes searchable.',
    'Replication for availability and read scaling: each shard is replicated to multiple nodes exactly as in a distributed database — a replica serves read (query) traffic and can be promoted if its primary shard fails, so query capacity and durability both scale with replica count independent of shard count.',
  ],
  keyPoints: [
    'The inverted index (term → posting list of documents) is the one data structure to know cold for this interview — it\'s what turns "scan everything" into "look up the term"',
    'BM25 (TF-IDF with saturation and length normalization) is the standard relevance-ranking answer — know why raw term frequency alone ranks poorly (a document repeating one word 100 times shouldn\'t dominate)',
    'Sharding splits the index for scale; every query fans out to all shards and a coordinator merges ranked results — this scatter-gather step is the main source of tail latency',
    'Indexing is near-real-time, not instantaneous: new documents land in an immutable segment and become searchable after a short refresh interval, not synchronously with the write',
    'Distinguish this from autocomplete/typeahead: distributed search ranks arbitrary free-text queries by relevance; autocomplete matches an exact prefix and ranks by pre-computed popularity',
  ],
}
