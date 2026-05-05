/**
 * Utility helpers for CodeVista
 */

/** Format a timestamp for the debug panel */
export function formatTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    '.' + String(now.getMilliseconds()).padStart(3, '0');
}

/** Pad a number to a fixed width string */
export function padNum(n, width = 2) {
  return String(n).padStart(width, '0');
}

/** Clamp a value between min and max */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Classify a JS token type for syntax highlighting */
export function classifyToken(token) {
  const keywords = new Set([
    'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for',
    'while', 'do', 'switch', 'case', 'break', 'continue', 'class',
    'new', 'this', 'import', 'export', 'default', 'from', 'async',
    'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof',
    'null', 'undefined', 'true', 'false',
  ]);

  if (keywords.has(token)) return 'keyword';
  if (/^["'`]/.test(token)) return 'string';
  if (/^-?\d/.test(token)) return 'number';
  if (/^\/\//.test(token)) return 'comment';
  if (/^[A-Z]/.test(token)) return 'class';
  return 'identifier';
}

/** Simple syntax-highlight a line of JS code into spans */
export function highlightLine(line) {
  // Escape HTML special chars in a plain text segment
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // We build the output by splitting on token boundaries and wrapping each token
  let result = '';
  let remaining = line;

  // Handle full-line comments first
  const commentIdx = remaining.search(/\/\//);
  let commentSuffix = '';
  if (commentIdx !== -1) {
    commentSuffix = remaining.slice(commentIdx);
    remaining = remaining.slice(0, commentIdx);
  }

  // Tokenize remaining (non-comment) part
  const tokenRe = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:function|const|let|var|return|if|else|for|while|do|switch|case|break|continue|class|new|this|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof|null|undefined|true|false)\b|\b\d+\.?\d*\b|[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())/g;

  let lastIdx = 0;
  let m;
  while ((m = tokenRe.exec(remaining)) !== null) {
    // Plain text before this match
    result += esc(remaining.slice(lastIdx, m.index));
    const tok = m[0];
    if (/^["'`]/.test(tok)) {
      result += `<span class="token-string">${esc(tok)}</span>`;
    } else if (/^\d/.test(tok)) {
      result += `<span class="token-number">${esc(tok)}</span>`;
    } else if (/^(function|const|let|var|return|if|else|for|while|do|switch|case|break|continue|class|new|this|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof|null|undefined|true|false)$/.test(tok)) {
      result += `<span class="token-keyword">${esc(tok)}</span>`;
    } else {
      result += `<span class="token-fn">${esc(tok)}</span>`;
    }
    lastIdx = m.index + tok.length;
  }
  result += esc(remaining.slice(lastIdx));

  // Append comment if any
  if (commentSuffix) {
    result += `<span class="token-comment">${esc(commentSuffix)}</span>`;
  }

  return result;
}

/** Generate a unique ID */
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Debounce a function */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
