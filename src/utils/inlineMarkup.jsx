// Minimal client-side rendering for the update composer's plain textarea:
// **bold**, *italic*, and line breaks only — deliberately not a full markdown
// parser or WYSIWYG editor, disproportionate for short update posts.
import React from 'react';

function renderLine(line, lineKey) {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<React.Fragment key={`${lineKey}-${key++}`}>{line.slice(lastIndex, match.index)}</React.Fragment>);
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={`${lineKey}-${key++}`}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={`${lineKey}-${key++}`}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < line.length) {
    parts.push(<React.Fragment key={`${lineKey}-${key++}`}>{line.slice(lastIndex)}</React.Fragment>);
  }
  return parts;
}

export function renderInlineMarkup(text) {
  if (!text) return null;
  const lines = String(text).split('\n');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {renderLine(line, i)}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}
