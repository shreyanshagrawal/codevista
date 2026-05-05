import { createContext, useContext, useReducer, useCallback } from 'react';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

sorted_nums = bubble_sort([64, 34, 25, 12, 22, 11])
print(sorted_nums)`,

  language: 'javascript',
  isPlaying: false,
  currentStep: 0,
  totalSteps: 0,
  speed: 1,
  steps: [],
  visualizationData: null,
  debugOutput: [],
  activeNodeId: null,
  theme: 'dark',
  layout: { leftWidth: 380, rightWidth: 320 },
  algorithmMode: 'general', // 'general' | 'linkedList' | 'binaryTree' | 'recursion'
  breakpoints: new Set(),
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_CODE':
      return { ...state, code: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_TOTAL_STEPS':
      return { ...state, totalSteps: action.payload };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'SET_STEPS_DATA':
      return { ...state, steps: action.payload };
    case 'SET_VISUALIZATION_DATA':
      return { ...state, visualizationData: action.payload };
    case 'APPEND_DEBUG':
      return { ...state, debugOutput: [...state.debugOutput, action.payload] };
    case 'CLEAR_DEBUG':
      return { ...state, debugOutput: [] };
    case 'SET_ACTIVE_NODE':
      return { ...state, activeNodeId: action.payload };
    case 'SET_ALGORITHM_MODE':
      return { ...state, algorithmMode: action.payload };
    case 'TOGGLE_BREAKPOINT': {
      const bp = new Set(state.breakpoints);
      bp.has(action.payload) ? bp.delete(action.payload) : bp.add(action.payload);
      return { ...state, breakpoints: bp };
    }
    case 'RESET':
      return {
        ...state,
        isPlaying: false,
        currentStep: 0,
        totalSteps: 0,
        steps: [],
        visualizationData: null,
        activeNodeId: null,
        debugOutput: [],
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    setCode: useCallback((code) => dispatch({ type: 'SET_CODE', payload: code }), []),
    setLanguage: useCallback((lang) => dispatch({ type: 'SET_LANGUAGE', payload: lang }), []),
    setIsPlaying: useCallback((v) => dispatch({ type: 'SET_PLAYING', payload: v }), []),
    setCurrentStep: useCallback((n) => dispatch({ type: 'SET_STEP', payload: n }), []),
    setTotalSteps: useCallback((n) => dispatch({ type: 'SET_TOTAL_STEPS', payload: n }), []),
    setSpeed: useCallback((s) => dispatch({ type: 'SET_SPEED', payload: s }), []),
    setStepsData: useCallback((s) => dispatch({ type: 'SET_STEPS_DATA', payload: s }), []),
    setVisualizationData: useCallback((d) => dispatch({ type: 'SET_VISUALIZATION_DATA', payload: d }), []),
    appendDebug: useCallback((msg) => dispatch({ type: 'APPEND_DEBUG', payload: msg }), []),
    clearDebug: useCallback(() => dispatch({ type: 'CLEAR_DEBUG' }), []),
    setActiveNode: useCallback((id) => dispatch({ type: 'SET_ACTIVE_NODE', payload: id }), []),
    setAlgorithmMode: useCallback((m) => dispatch({ type: 'SET_ALGORITHM_MODE', payload: m }), []),
    toggleBreakpoint: useCallback((line) => dispatch({ type: 'TOGGLE_BREAKPOINT', payload: line }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
