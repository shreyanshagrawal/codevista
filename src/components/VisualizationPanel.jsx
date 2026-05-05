import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { NodeType } from '../engine/executionEngine';

const EDGE_COLOR = 'rgba(108, 99, 255, 0.35)';
const EDGE_ACTIVE_COLOR = 'rgba(0, 212, 170, 0.8)';

const TYPE_ICONS = {
  [NodeType.FUNCTION_DEF]:  '⨍',
  [NodeType.FUNCTION_CALL]: '◎',
  [NodeType.CONDITIONAL]:   '◇',
  [NodeType.LOOP]:          '↺',
  [NodeType.ASSIGNMENT]:    '←',
  [NodeType.RETURN]:        '⤶',
  [NodeType.EXPRESSION]:    '·',
  [NodeType.CONSOLE]:       '▸',
};

export default function VisualizationPanel({ graph }) {
  const { state, actions } = useAppStore();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [viewOffset, setViewOffset] = useState({ x: 30, y: 30 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Canvas drawing
  useEffect(() => {
    if (!graph || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(scale, scale);

    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));

    // Draw edges
    graph.edges.forEach(edge => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) return;

      const fromX = from.x + (from.width ? from.width / 2 : 100);
      const fromY = from.y + (from.height || 50);
      const toX = to.x + (to.width ? to.width / 2 : 100);
      const toY = to.y;

      const isActive = from.id === state.activeNodeId || to.id === state.activeNodeId;

      ctx.beginPath();
      ctx.strokeStyle = isActive ? EDGE_ACTIVE_COLOR : EDGE_COLOR;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.setLineDash(isActive ? [] : [4, 4]);

      // Bezier curve
      if (edge.isLoop) {
        // Draw loop back upward with a wide arc
        const cpX = Math.max(fromX, toX) + 150;
        ctx.moveTo(fromX, fromY);
        ctx.bezierCurveTo(cpX, fromY + 50, cpX, toY - 50, toX, toY);
      } else {
        // Top-down curve
        const cpY = (fromY + toY) / 2;
        ctx.moveTo(fromX, fromY);
        ctx.bezierCurveTo(fromX, cpY, toX, cpY, toX, toY);
      }
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.setLineDash([]);
      ctx.fillStyle = isActive ? EDGE_ACTIVE_COLOR : EDGE_COLOR;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - 8 * Math.cos(angle - 0.4), toY - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(toX - 8 * Math.cos(angle + 0.4), toY - 8 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }, [graph, state.activeNodeId, viewOffset, scale]);

  // Panning
  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setViewOffset(v => ({ x: v.x + dx, y: v.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    setScale(s => Math.min(2, Math.max(0.3, s - e.deltaY * 0.001)));
  }, []);

  if (!graph) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in"
        style={{ background: 'var(--color-bg-surface)' }}>
        <div className="text-6xl opacity-20">⬡</div>
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Press <kbd
            className="px-2 py-0.5 rounded text-xs mx-1"
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-bright)', color: 'var(--color-text-secondary)' }}
          >▶ Run</kbd> to visualize your code
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Drag to pan · Scroll to zoom
        </div>
      </div>
    );
  }

  const totalW = graph.nodes.reduce((m, n) => Math.max(m, n.x + 220), 0);
  const totalH = graph.nodes.reduce((m, n) => Math.max(m, n.y + 60), 0);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden select-none animate-fade-in"
      style={{ background: 'var(--color-bg-surface)', cursor: dragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"
            patternTransform={`translate(${viewOffset.x % 40},${viewOffset.y % 40}) scale(${scale})`}>
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Edge canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Nodes */}
      <div
        className="absolute"
        style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})`, transformOrigin: '0 0' }}
      >
        {graph.nodes.map(node => {
          const isActive = node.id === state.activeNodeId;
          
          let svgShape = null;
          if (node.type === NodeType.FUNCTION_DEF || node.type === NodeType.RETURN) {
            // Oval
            svgShape = (
              <rect x="2" y="2" width="196" height="46" rx="23" ry="23" 
                    fill={node.colors.bg} stroke={isActive ? node.colors.border : node.colors.border + '55'} strokeWidth="2" />
            );
          } else if (node.type === NodeType.CONDITIONAL || node.type === NodeType.LOOP) {
            // Diamond
            svgShape = (
              <polygon points="100,2 198,50 100,98 2,50" 
                       fill={node.colors.bg} stroke={isActive ? node.colors.border : node.colors.border + '55'} strokeWidth="2" />
            );
          } else if (node.type === NodeType.CONSOLE) {
            // Parallelogram
            svgShape = (
              <polygon points="20,2 198,2 180,48 2,48" 
                       fill={node.colors.bg} stroke={isActive ? node.colors.border : node.colors.border + '55'} strokeWidth="2" />
            );
          } else {
            // Process Rectangle
            svgShape = (
              <rect x="2" y="2" width="196" height="46" rx="4" ry="4" 
                    fill={node.colors.bg} stroke={isActive ? node.colors.border : node.colors.border + '55'} strokeWidth="2" />
            );
          }

          return (
            <div
              key={node.id}
              onClick={() => actions.setActiveNode(node.id)}
              className="vis-node absolute flex flex-col justify-center items-center text-center cursor-pointer"
              style={{
                left: node.x,
                top: node.y,
                width: node.width || 200,
                height: node.height || 50,
                transition: 'all 0.25s ease',
                transform: isActive ? 'scale(1.04)' : 'scale(1)',
                zIndex: isActive ? 10 : 1,
              }}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${node.width || 200} ${node.height || 50}`}>
                {svgShape}
              </svg>

              {/* Active pulse ring */}
              {isActive && (
                <div className="absolute inset-0 rounded-lg animate-ping pointer-events-none" 
                     style={{ border: `2px solid ${node.colors.border}`, opacity: 0.3 }} />
              )}

              {/* Node Content */}
              <div className="relative z-10 flex flex-col justify-center items-center w-full px-8 pointer-events-none">
                <div className="flex items-center justify-center gap-1.5 mb-1 w-full">
                  <span
                    className="text-xs px-1.5 py-0 rounded-full font-mono uppercase tracking-wider"
                    style={{
                      background: node.colors.border + '22',
                      color: node.colors.label,
                      fontSize: '0.55rem',
                    }}
                  >
                    {node.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.55rem' }}>
                    L{node.line}
                  </span>
                </div>

                <div
                  className="text-xs font-mono truncate w-full"
                  style={{ color: node.colors.label, fontSize: '0.70rem', lineHeight: 1.2 }}
                  title={node.label}
                >
                  {node.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-4 right-4 flex flex-col gap-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {[
          { label: '+', action: () => setScale(s => Math.min(2, s + 0.15)), id: 'zoom-in' },
          { label: '⊙', action: () => { setScale(1); setViewOffset({ x: 30, y: 30 }); }, id: 'zoom-reset' },
          { label: '−', action: () => setScale(s => Math.max(0.3, s - 0.15)), id: 'zoom-out' },
        ].map(z => (
          <button
            key={z.id}
            id={z.id}
            onClick={z.action}
            className="w-8 h-8 rounded flex items-center justify-center text-sm transition-all hover:opacity-90"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-bright)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {z.label}
          </button>
        ))}
      </div>

      {/* Node count badge */}
      <div
        className="absolute top-3 right-3 text-xs px-2 py-1 rounded font-mono"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        {graph.nodes.length} nodes · {graph.edges.length} edges · {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
