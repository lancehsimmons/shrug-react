// Parses Markdown-style [text](url) links in blog post body text.
// Matches: [display text](https://example.com)
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

export function renderBodyWithLinks(body) {
  // Accumulates the pieces (plain strings and <a> elements) to render in order.
  const parts = [];
  // Tracks where in `body` we've copied text up to so far.
  let lastIndex = 0;
  let match;
  // Gives each <a> a unique React key since there can be multiple links.
  let key = 0;

  // Walk through every [text](url) match left to right.
  while ((match = LINK_PATTERN.exec(body)) !== null) {
    const [fullMatch, linkText, url] = match;

    // Preserve any plain text that sits before this match.
    if (match.index > lastIndex) {
      parts.push(body.slice(lastIndex, match.index));
    }

    // Replace the matched [text](url) with a real link element.
    parts.push(
      <a key={key++} href={url} target="_blank" rel="noopener noreferrer">
        {linkText}
      </a>
    );

    // Advance past this match so the next loop iteration continues from here.
    lastIndex = match.index + fullMatch.length;
  }

  // Append any trailing plain text after the last match.
  if (lastIndex < body.length) {
    parts.push(body.slice(lastIndex));
  }

  return parts;
}
