import { useState, useEffect } from 'react';
import { AppProvider } from './store/useAppStore';
import { useVisualizer } from './engine/useVisualizer';
import CodeEditorPanel from './components/CodeEditorPanel';
import DebugPanel from './components/DebugPanel';
import ControlBar from './components/ControlBar';
import VisualizationPanel from './components/VisualizationPanel';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import TreeVisualizer from './components/TreeVisualizer';
import RecursionVisualizer from './components/RecursionVisualizer';
import { useAppStore } from './store/useAppStore';

const DEFAULT_CODE = {
  general: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

sorted_nums = bubble_sort([64, 34, 25, 12, 22, 11])
print(sorted_nums)`,
  linkedList: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = new_node

values = [10, 20, 30, 40, 50]

ll = LinkedList()
for val in values:
    ll.append(val)
print("Linked list created successfully!")`,
  binaryTree: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder_traversal(root):
    if not root:
        return []
    return inorder_traversal(root.left) + [root.val] + inorder_traversal(root.right)

tree_nodes = [10, 20, 30, 40, 50, 60, 70]
print("Tree inorder traversal complete!")`,
  recursion: `def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

target = factorial(5)
print(target)`
};

function AppShell() {
  const { state } = useAppStore();
  const { graph, steps, play, pause, next, prev, reset } = useVisualizer();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial app initialization delay for loading state
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full animate-pulse" style={{ background: 'var(--color-bg-base)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-xl" style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)', boxShadow: '0 0 30px rgba(108, 99, 255, 0.4)' }}>
          ⬡
        </div>
        <div className="font-mono text-sm tracking-widest text-white/50">INITIALIZING ENGINE...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-base)' }}>
      {/* Top navbar */}
      <TopNav />

      {/* Main workspace */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Code Editor (hidden on extremely small screens, or stacked) */}
        <div className="lg:h-full lg:block hidden border-r shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <CodeEditorPanel key={state.algorithmMode} />
        </div>

        {/* Center: Visualization canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas toolbar */}
          <CanvasToolbar />

          {/* Visualizer */}
          {state.algorithmMode === 'general' && <VisualizationPanel graph={graph} />}
          {state.algorithmMode === 'linkedList' && <LinkedListVisualizer step={steps[state.currentStep]} />}
          {state.algorithmMode === 'binaryTree' && <TreeVisualizer step={steps[state.currentStep]} />}
          {state.algorithmMode === 'recursion' && <RecursionVisualizer step={steps[state.currentStep]} />}
        </main>

        {/* Right: Debug Panel (hidden on small screens, stacked on med) */}
        <div className="lg:h-full lg:block hidden border-l shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <DebugPanel steps={steps} />
        </div>
      </div>

      {/* Bottom: Control bar */}
      <ControlBar
        onRun={play}
        onPause={pause}
        onStep={next}
        onStepBackward={prev}
        onReset={reset}
      />
    </div>
  );
}

function TopNav() {
  return (
    <header
      className="flex items-center justify-between px-5 py-2.5 border-b shrink-0"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-base)',
        height: '48px',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)' }}
        >
          ⬡
        </div>
        <div>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            CodeVista
          </span>
          <span
            className="ml-2 text-xs px-1.5 py-0.5 rounded font-mono"
            style={{
              background: 'var(--color-accent-glow)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent)',
              fontSize: '0.6rem',
            }}
          >
            v0.1
          </span>
        </div>
      </div>

    </header>
  );
}

function CanvasToolbar() {
  const { state, actions } = useAppStore();
  const modes = [
    { value: 'general',    label: '⬡ General Code' },
    { value: 'linkedList', label: '⧖ Linked List' },
    { value: 'binaryTree', label: '⊳ Binary Tree' },
    { value: 'recursion',  label: '▤ Recursion' },
  ];

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 border-b shrink-0"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-panel)',
        height: '40px',
      }}
    >
      {modes.map(m => (
        <button
          key={m.value}
          id={`mode-${m.value}`}
          onClick={() => {
            actions.setAlgorithmMode(m.value);
            actions.setCode(DEFAULT_CODE[m.value]);
            actions.reset(); // reset engine when switching mode
          }}
          className="text-xs px-3 py-1 rounded transition-all duration-150"
          style={{
            cursor: 'pointer',
            border: '1px solid',
            borderColor: state.algorithmMode === m.value ? 'var(--color-accent)' : 'transparent',
            background: state.algorithmMode === m.value ? 'var(--color-accent-glow)' : 'transparent',
            color: state.algorithmMode === m.value ? 'var(--color-accent)' : 'var(--color-text-muted)',
          }}
        >
          {m.label}
        </button>
      ))}

      <div className="flex-1" />

      <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        Visualization Canvas
      </span>
    </div>
  );
}



export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
