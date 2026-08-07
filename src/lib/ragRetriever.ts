/**
 * RAG Retriever — Speedy Loan Finance Services
 * Lightweight keyword-based retriever. Scores each knowledge chunk
 * against the incoming query and returns the top-N most relevant chunks.
 */

import { KNOWLEDGE_BASE, KnowledgeChunk } from "./ragKnowledge";

// ─── Tokenise & normalise ─────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s₹]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// Common stop words to ignore during scoring
const STOP_WORDS = new Set([
  "i", "me", "my", "we", "our", "you", "your", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "should", "could", "can", "may", "might", "shall", "the", "a",
  "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "about", "as", "into", "through", "during", "this", "that",
  "these", "those", "it", "its", "what", "which", "who", "how", "when",
  "where", "why", "all", "any", "each", "both", "few", "more", "most",
  "other", "some", "such", "no", "not", "only", "same", "so", "than",
  "too", "very", "just", "if", "then", "than", "there", "want", "need",
  "get", "give", "tell", "know", "look", "find", "go", "please", "help",
  "ask", "like", "make", "see", "use", "give", "take", "also", "here",
]);

function filterStopWords(tokens: string[]): string[] {
  return tokens.filter((t) => !STOP_WORDS.has(t));
}

// ─── Score a single chunk against the query tokens ───────────────────────────
function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[]): number {
  let score = 0;

  for (const qt of queryTokens) {
    // Exact topic match — highest weight
    if (chunk.topics.includes(qt)) {
      score += 10;
    }
    // Partial topic match (topic contains query token or vice versa)
    for (const topic of chunk.topics) {
      if (topic !== qt && (topic.includes(qt) || qt.includes(topic))) {
        score += 4;
      }
    }
    // Content mention — lower weight
    if (chunk.content.toLowerCase().includes(qt)) {
      score += 2;
    }
  }

  // Bonus: multi-word phrase match (up to bigrams)
  const queryPhrase = queryTokens.join(" ");
  for (const topic of chunk.topics) {
    if (queryPhrase.includes(topic) && topic.split(" ").length > 1) {
      score += 15; // strong bonus for multi-word topic match
    }
  }

  return score;
}

// ─── Main retrieval function ─────────────────────────────────────────────────
export interface RetrievedContext {
  chunks: KnowledgeChunk[];
  contextString: string;
}

export function retrieve(query: string, topN = 4): RetrievedContext {
  const rawTokens = tokenize(query);
  const queryTokens = filterStopWords(rawTokens);

  // If no meaningful tokens, include fallback overview chunks
  if (queryTokens.length === 0) {
    const fallbacks = KNOWLEDGE_BASE.slice(0, 2);
    return {
      chunks: fallbacks,
      contextString: buildContextString(fallbacks),
    };
  }

  // Score every chunk
  const scored = KNOWLEDGE_BASE.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, queryTokens),
  }));

  // Sort by score descending; take top N with score > 0
  const topChunks = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.chunk);

  // Always include company info if it's not already in top chunks
  const hasCompanyInfo = topChunks.some((c) => c.id === "company_overview");
  if (!hasCompanyInfo && topChunks.length < topN) {
    const companyChunk = KNOWLEDGE_BASE.find((c) => c.id === "company_overview");
    if (companyChunk) topChunks.push(companyChunk);
  }

  return {
    chunks: topChunks,
    contextString: buildContextString(topChunks),
  };
}

function buildContextString(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map((c) => `[${c.id.replace(/_/g, " ").toUpperCase()}]\n${c.content}`)
    .join("\n\n---\n\n");
}
