import "server-only";

// Escapes the characters LIKE treats as wildcards, so a search for "50%"
// finds "50%" and not everything
export function likePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}
