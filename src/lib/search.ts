export interface Doc {
  title: string;
  category: string;
  path: string;
  content: string;
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'to', 'of', 'for', 'and', 'or',
  'do', 'how', 'can', 'i', 'my', 'me', 'what', 'with', 'this', 'that', 'from',
  'be', 'are', 'was', 'were', 'has', 'have', 'had', 'not', 'but', 'if', 'so',
  'at', 'by', 'up', 'about', 'into', 'through', 'just', 'also', 'than', 'then',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

export function searchDocs(docs: Doc[], query: string, topK = 8): Doc[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return docs.slice(0, topK);

  const scored = docs.map(doc => {
    const titleLower = doc.title.toLowerCase();
    const contentLower = doc.content.toLowerCase();

    let score = 0;
    for (const token of queryTokens) {
      // Title exact word match (high weight)
      if (titleLower.includes(token)) score += 10;
      // Title starts with query token (even higher for direct lookups)
      if (titleLower.startsWith(token)) score += 5;
      // Content matches
      const contentMatches = (contentLower.match(new RegExp(token, 'g')) || []).length;
      score += Math.min(contentMatches, 5); // Cap per-token content score
    }

    // Boost exact title match
    const queryLower = query.toLowerCase().trim();
    if (titleLower.replace(/ (command|tool)$/i, '').toLowerCase() === queryLower) {
      score += 50;
    }

    // Slight boost for tools/commands over general pages
    if (doc.category !== 'general') score += 1;

    return { doc, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.doc);
}
