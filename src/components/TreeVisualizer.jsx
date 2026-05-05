import { useMemo } from 'react';

export default function TreeVisualizer({ step }) {
  if (!step || !step.data || !step.data.tree) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in" style={{ background: 'var(--color-bg-surface)' }}>
        <div className="text-6xl opacity-20">⊳</div>
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Waiting for binary tree traversal steps...
        </div>
      </div>
    );
  }

  const { tree, currentNodeId, visitedIds, message } = step.data;
  
  // Calculate node positions and edge connections
  const { nodesWithPos, edges } = useMemo(() => {
    if (!tree.root) return { nodesWithPos: [], edges: [] };
    
    const CANVAS_WIDTH = 800; // Define a virtual canvas width
    const Y_START = 60;
    const Y_SPACING = 80;
    
    const nodesMap = new Map();
    const edgesList = [];
    
    // Recursively assign positions by dividing the horizontal space
    function assignPositions(node, left, right, depth) {
      if (!node) return;
      
      const x = (left + right) / 2;
      const y = Y_START + depth * Y_SPACING;
      
      nodesMap.set(node.id, { ...node, x, y });
      
      if (node.left) {
        edgesList.push({ from: node.id, to: node.left.id });
        assignPositions(node.left, left, x, depth + 1);
      }
      if (node.right) {
        edgesList.push({ from: node.id, to: node.right.id });
        assignPositions(node.right, x, right, depth + 1);
      }
    }
    
    assignPositions(tree.root, 0, CANVAS_WIDTH, 0);
    
    return { 
      nodesWithPos: Array.from(nodesMap.values()), 
      edges: edgesList.map(e => ({
        from: nodesMap.get(e.from),
        to: nodesMap.get(e.to)
      }))
    };
  }, [tree]);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center relative overflow-hidden animate-fade-in" style={{ background: 'var(--color-bg-surface)' }}>
      {/* Canvas container: perfectly aligned edges and nodes */}
      <div className="absolute inset-0 pointer-events-none flex justify-center overflow-hidden">
        <div className="relative" style={{ width: 800, height: '100%' }}>
          {/* SVG Canvas for Edges */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {edges.map((edge, i) => {
              // Highlight edge if it connects the active node, or if both ends are visited
              const isFromVisited = visitedIds.includes(edge.from.id) || currentNodeId === edge.from.id;
              const isToVisited = visitedIds.includes(edge.to.id) || currentNodeId === edge.to.id;
              const isActive = isFromVisited && isToVisited;

              return (
                <line
                  key={i}
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke={isActive ? 'var(--color-accent)' : 'var(--color-border)'}
                  strokeWidth={isActive ? 3 : 2}
                  className="transition-all duration-300"
                  strokeDasharray={isActive ? 'none' : '4 4'}
                />
              );
            })}
          </svg>

          {/* Nodes using absolute positioning */}
          {nodesWithPos.map(node => {
            const isCurrent = node.id === currentNodeId;
            const isVisited = visitedIds.includes(node.id);
            
            // Dynamic styling based on node state
            let bg = 'var(--color-bg-panel)';
            let borderColor = 'var(--color-border)';
            let textColor = 'var(--color-text-secondary)';
            let scale = 'scale(1)';
            let zIndex = 1;

            if (isCurrent) {
              bg = 'var(--color-bg-elevated)';
              borderColor = 'var(--color-accent)';
              textColor = 'var(--color-accent)';
              scale = 'scale(1.15)';
              zIndex = 10;
            } else if (isVisited) {
              bg = 'var(--color-accent-glow)';
              borderColor = 'var(--color-accent-2)';
              textColor = 'var(--color-accent-2)';
            }

            return (
              <div
                key={node.id}
                className="absolute flex items-center justify-center rounded-full font-mono font-bold transition-all duration-300"
                style={{
                  width: 48,
                  height: 48,
                  left: node.x - 24, // Center offset
                  top: node.y - 24,  // Center offset
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  color: textColor,
                  transform: scale,
                  zIndex,
                  boxShadow: isCurrent ? '0 0 20px var(--color-accent-glow)' : '0 4px 6px rgba(0,0,0,0.3)',
                }}
              >
                {node.value}
                
                {/* Ping animation for active node */}
                {isCurrent && (
                  <span 
                    className="absolute inset-0 rounded-full animate-ping pointer-events-none" 
                    style={{ border: `2px solid var(--color-accent)`, opacity: 0.5 }} 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Message Floating at Bottom */}
      <div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-mono shadow-xl transition-all border"
        style={{
          background: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-bright)',
          color: 'var(--color-text-secondary)'
        }}
      >
        {message}
      </div>
    </div>
  );
}
