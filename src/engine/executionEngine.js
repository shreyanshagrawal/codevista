/**
 * Execution Engine — simulates step-by-step code execution
 * for the visualization pipeline.
 *
 * In a real implementation, this would parse the AST and walk it.
 * Here we produce a deterministic list of "execution steps" from the
 * code text so that the visualizer has something to animate over.
 */

import { uid } from '../utils/formatters';

// ─── Node types ───────────────────────────────────────────────────────────────
export const NodeType = {
  FUNCTION_DEF: 'function_def',
  FUNCTION_CALL: 'function_call',
  CONDITIONAL: 'conditional',
  LOOP: 'loop',
  ASSIGNMENT: 'assignment',
  RETURN: 'return',
  EXPRESSION: 'expression',
  CONSOLE: 'console',
};

const NODE_COLORS = {
  [NodeType.FUNCTION_DEF]:  { bg: 'var(--color-bg-elevated)', border: 'var(--color-accent)', label: 'var(--color-text-primary)' },
  [NodeType.FUNCTION_CALL]: { bg: 'var(--color-bg-elevated)', border: 'var(--color-accent-2)', label: 'var(--color-text-primary)' },
  [NodeType.CONDITIONAL]:   { bg: 'var(--color-bg-elevated)', border: 'var(--color-syntax-number)', label: 'var(--color-text-primary)' },
  [NodeType.LOOP]:          { bg: 'var(--color-bg-elevated)', border: 'var(--color-syntax-string)', label: 'var(--color-text-primary)' },
  [NodeType.ASSIGNMENT]:    { bg: 'var(--color-bg-elevated)', border: 'var(--color-syntax-keyword)', label: 'var(--color-text-primary)' },
  [NodeType.RETURN]:        { bg: 'var(--color-bg-elevated)', border: 'var(--color-accent-3)', label: 'var(--color-text-primary)' },
  [NodeType.EXPRESSION]:    { bg: 'var(--color-bg-elevated)', border: 'var(--color-text-muted)', label: 'var(--color-text-primary)' },
  [NodeType.CONSOLE]:       { bg: 'var(--color-bg-elevated)', border: 'var(--color-accent-2)', label: 'var(--color-text-primary)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lineToNodeType(line) {
  const t = line.trim();
  if (/^(function|def)\s+/.test(t) || /^(const|let|var)\s+\w+\s*=\s*(async\s+)?function/.test(t) || /=>\s*{?$/.test(t)) return NodeType.FUNCTION_DEF;
  if (/\b(console\.(log|error|warn|info)|print)\b/.test(t)) return NodeType.CONSOLE;
  if (/^(if|elif|else if|else)\b/.test(t)) return NodeType.CONDITIONAL;
  if (/^(for|while|do)\b/.test(t)) return NodeType.LOOP;
  if (/^return\b/.test(t)) return NodeType.RETURN;
  if (/^(const|let|var)\s/.test(t) || /\w+\s*=\s*/.test(t) || /\+=|-=|\*=|\/=/.test(t)) return NodeType.ASSIGNMENT;
  if (/\w+\s*\(/.test(t)) return NodeType.FUNCTION_CALL;
  return NodeType.EXPRESSION;
}

/**
 * Parse source code lines into a graph of nodes + edges.
 * Returns: { nodes: [], edges: [] }
 */
export function parseToGraph(code) {
  const lines = code.split('\n');
  const nodes = [];
  const edges = [];

  const mainStart = { id: uid(), type: 'start', label: 'START (main)', line: 0, indent: 0, colors: NODE_COLORS[NodeType.FUNCTION_DEF], xOffset: 100 };
  nodes.push(mainStart);
  let lastMain = mainStart;

  let currentFunc = null;
  const funcs = [];
  let currentXOffset = 100;
  
  const stack = []; // for loops

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed === '{' || trimmed === '}' || trimmed === '};' || trimmed.startsWith('#')) return;

    const lineIndent = rawLine.search(/\S/);

    const poppedLoops = [];
    while (stack.length > 0 && lineIndent <= stack[stack.length - 1].indent) {
      const popped = stack.pop();
      if (popped.type === NodeType.LOOP) poppedLoops.push(popped);
    }

    const type = lineToNodeType(trimmed);
    const node = {
      id: uid(),
      type,
      label: trimmed.length > 42 ? trimmed.slice(0, 40) + '…' : trimmed,
      line: index + 1,
      indent: lineIndent,
      colors: NODE_COLORS[type] || NODE_COLORS[NodeType.EXPRESSION],
    };
    nodes.push(node);

    let contextLastNode = currentFunc ? currentFunc.lastNode : lastMain;

    if (type === NodeType.FUNCTION_DEF) {
      currentXOffset += 350;
      node.xOffset = currentXOffset;
      currentFunc = { name: trimmed, lastNode: node, startNode: node, baseIndent: lineIndent, xOffset: currentXOffset };
      funcs.push(currentFunc);
    } else if (currentFunc && lineIndent > currentFunc.baseIndent) {
      node.xOffset = currentXOffset;
      edges.push({ id: uid(), from: contextLastNode.id, to: node.id });
      currentFunc.lastNode = node;
    } else {
      currentFunc = null;
      currentXOffset = 100;
      node.xOffset = currentXOffset;
      edges.push({ id: uid(), from: lastMain.id, to: node.id });
      lastMain = node;
    }

    // Connect loops back to themselves 
    if (poppedLoops.length > 0) {
       poppedLoops.forEach(loopNode => {
         edges.push({ id: uid(), from: contextLastNode.id, to: loopNode.id, isLoop: true });
       });
    }

    if (trimmed.endsWith(':') || trimmed.endsWith('{')) {
       stack.push(node);
    }
  });

  // Add END nodes
  const mainEnd = { id: uid(), type: 'start', label: 'END (main)', line: lines.length + 1, indent: 0, colors: NODE_COLORS[NodeType.FUNCTION_DEF], xOffset: 100 };
  nodes.push(mainEnd);
  edges.push({ id: uid(), from: lastMain.id, to: mainEnd.id });

  funcs.forEach(f => {
    const fEnd = { id: uid(), type: 'start', label: 'END', line: f.lastNode.line, indent: f.baseIndent, colors: NODE_COLORS[NodeType.FUNCTION_DEF], xOffset: f.xOffset };
    nodes.push(fEnd);
    edges.push({ id: uid(), from: f.lastNode.id, to: fEnd.id });
  });

  return layoutGraph({ nodes, edges });
}

/**
 * Top-down hierarchical layout.
 */
function layoutGraph({ nodes, edges }) {
  const ROW_HEIGHT = 160;
  const COL_WIDTH = 120;
  const V_PAD = 80;

  const yIndices = {};

  nodes.forEach((node) => {
    if (yIndices[node.xOffset] === undefined) yIndices[node.xOffset] = 0;
    
    // Remove indentation shift to force a perfectly linear vertical flowchart
    node.x = node.xOffset;
    node.y = V_PAD + yIndices[node.xOffset] * ROW_HEIGHT;
    
    yIndices[node.xOffset]++;
    
    // Set explicit size for drawing
    node.width = 200;
    node.height = node.type === NodeType.CONDITIONAL || node.type === NodeType.LOOP ? 100 : 50;
  });

  return { nodes, edges };
}

/**
 * Build a list of step-by-step execution events from the graph.
 * Each step references a node id and carries state info.
 */
export function buildExecutionSteps(graph) {
  return graph.nodes.map((node, i) => {
    const vars = buildVariablesAt(graph.nodes, i);
    let output = null;
    let message = `Executing: ${node.label}`;

    if (node.type === NodeType.CONSOLE) {
      const arg = extractConsoleArg(node.label).trim();
      const val = vars[arg] !== undefined ? vars[arg] : arg;
      output = `[stdout] ${val}`;
      message = `Printing value of ${arg} to console: ${val}`;
    } else if (node.type === NodeType.FUNCTION_DEF) {
      message = `Defining function or starting execution context.`;
    } else if (node.type === NodeType.CONDITIONAL) {
      message = `Evaluating condition: ${node.label}`;
    } else if (node.type === NodeType.LOOP) {
      message = `Looping statement. Checking loop condition.`;
    } else if (node.type === NodeType.ASSIGNMENT) {
      message = `Variable assignment detected. Updating scope variables.`;
    } else if (node.type === NodeType.FUNCTION_CALL) {
      message = `Calling function: ${node.label}`;
    }

    return {
      line: node.line,
      action: node.type,
      data: {
        nodeId: node.id,
        label: node.label,
        output: output,
        message: message
      },
      stateSnapshot: {
        callStack: buildCallStackAt(graph.nodes, i),
        variables: vars,
      }
    };
  });
}

function buildCallStackAt(nodes, upToIdx) {
  return nodes
    .slice(0, upToIdx + 1)
    .filter(n => n.type === NodeType.FUNCTION_DEF || n.type === NodeType.FUNCTION_CALL)
    .slice(-4)
    .map(n => n.label);
}

function buildVariablesAt(nodes, upToIdx) {
  const vars = {};
  nodes.slice(0, upToIdx + 1).forEach(n => {
    // Match standard assignments (Python and JS)
    const match = n.label.match(/^(?:const\s+|let\s+|var\s+)?([a-zA-Z_]\w*)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      
      // Inline mock for bubble_sort arrays so the output doesn't just print the text "bubble_sort(...)"
      if (val.includes('bubble_sort(')) {
        const arrMatch = val.match(/\[(.*?)\]/);
        if (arrMatch) {
          try {
             const arr = JSON.parse(`[${arrMatch[1]}]`);
             arr.sort((a,b) => a-b);
             val = `[${arr.join(', ')}]`;
          } catch(e) {}
        }
      }
      vars[key] = val;
    }
  });
  return vars;
}

function extractConsoleArg(label) {
  const m = label.match(/(?:console\.\w+|print)\((.+)\)$/);
  return m ? m[1] : label;
}

export function validateSyntax(code) {
  if (!code || !code.trim()) {
    return { valid: false, line: 1, message: "Code is empty" };
  }
  
  const lines = code.split('\n');
  const stack = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '(' || char === '[' || char === '{') stack.push({char, line: i + 1});
      if (char === ')' || char === ']' || char === '}') {
        if (stack.length === 0) return { valid: false, line: i + 1, message: `Unexpected '${char}'` };
        const last = stack.pop();
        if (
          (char === ')' && last.char !== '(') ||
          (char === ']' && last.char !== '[') ||
          (char === '}' && last.char !== '{')
        ) {
          return { valid: false, line: i + 1, message: `Mismatched '${last.char}' and '${char}'` };
        }
      }
    }
  }
  if (stack.length > 0) {
    return { valid: false, line: stack[0].line, message: `Unclosed '${stack[0].char}'` };
  }
  
  // Custom simple checks for trailing '='
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^[\w\s]+=\s*$/)) {
      return { valid: false, line: i + 1, message: `Incomplete assignment` };
    }
  }
  
  return { valid: true, line: null, message: null };
}
