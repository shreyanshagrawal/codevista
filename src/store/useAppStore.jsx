import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

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
  theme: localStorage.getItem('codevista-theme') || 'default',
  layout: { leftWidth: 380, rightWidth: 320 },
  algorithmMode: 'general', // 'general' | 'linkedList' | 'binaryTree' | 'recursion'
  breakpoints: new Set(),
  syntaxError: null,
  activePage: 'workspace', // 'workspace' | 'settings'
  settings: {
    // General
    defaultSpeed: 1,
    soundEffects: false,
    autoScroll: true,
    compactMode: false,
    // Visualization
    defaultArraySize: 7,
    showStepCounter: true,
    showOperationCounters: true,
    smoothAnimations: true,
    particleEffects: false,
    // Accessibility
    fontSize: 'medium', // 'small', 'medium', 'large'
    highContrast: false,
    reducedMotion: false,
  }
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_CODE':
      if (state.code !== action.payload) {
        return { 
          ...state, 
          code: action.payload,
          isPlaying: false,
          currentStep: 0,
          totalSteps: 0,
          steps: [],
          visualizationData: null,
          activeNodeId: null
        };
      }
      return state;
    case 'SET_LANGUAGE':
      if (state.language === action.payload) return state;
      return { ...state, language: action.payload };
    case 'SET_PLAYING':
      if (state.isPlaying === action.payload) return state;
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
      if (state.activeNodeId === action.payload) return state;
      return { ...state, activeNodeId: action.payload };
    case 'SET_ALGORITHM_MODE':
      if (state.algorithmMode === action.payload) return state;
      return { ...state, algorithmMode: action.payload };
    case 'SET_SYNTAX_ERROR':
      // deep compare syntax error if possible, or simple check
      if (state.syntaxError === action.payload) return state;
      if (state.syntaxError && action.payload && state.syntaxError.message === action.payload.message && state.syntaxError.line === action.payload.line) return state;
      return { ...state, syntaxError: action.payload };
    case 'TOGGLE_BREAKPOINT': {
      const bp = new Set(state.breakpoints);
      bp.has(action.payload) ? bp.delete(action.payload) : bp.add(action.payload);
      return { ...state, breakpoints: bp };
    }
    case 'SET_ACTIVE_PAGE':
      if (state.activePage === action.payload) return state;
      return { ...state, activePage: action.payload };
    case 'SET_THEME':
      if (state.theme === action.payload) return state;
      return { ...state, theme: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'RESET_SETTINGS':
      return { ...state, settings: initialState.settings };
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

  const actions = useMemo(() => ({
    setCode: (code) => dispatch({ type: 'SET_CODE', payload: code }),
    setLanguage: (lang) => dispatch({ type: 'SET_LANGUAGE', payload: lang }),
    setIsPlaying: (v) => dispatch({ type: 'SET_PLAYING', payload: v }),
    setCurrentStep: (n) => dispatch({ type: 'SET_STEP', payload: n }),
    setTotalSteps: (n) => dispatch({ type: 'SET_TOTAL_STEPS', payload: n }),
    setSpeed: (s) => dispatch({ type: 'SET_SPEED', payload: s }),
    setStepsData: (s) => dispatch({ type: 'SET_STEPS_DATA', payload: s }),
    setVisualizationData: (d) => dispatch({ type: 'SET_VISUALIZATION_DATA', payload: d }),
    appendDebug: (msg) => dispatch({ type: 'APPEND_DEBUG', payload: msg }),
    clearDebug: () => dispatch({ type: 'CLEAR_DEBUG' }),
    setActiveNode: (id) => dispatch({ type: 'SET_ACTIVE_NODE', payload: id }),
    setAlgorithmMode: (m) => dispatch({ type: 'SET_ALGORITHM_MODE', payload: m }),
    setSyntaxError: (err) => dispatch({ type: 'SET_SYNTAX_ERROR', payload: err }),
    toggleBreakpoint: (line) => dispatch({ type: 'TOGGLE_BREAKPOINT', payload: line }),
    setActivePage: (p) => dispatch({ type: 'SET_ACTIVE_PAGE', payload: p }),
    setTheme: (t) => dispatch({ type: 'SET_THEME', payload: t }),
    updateSettings: (s) => dispatch({ type: 'SET_SETTINGS', payload: s }),
    resetSettings: () => dispatch({ type: 'RESET_SETTINGS' }),
    reset: () => dispatch({ type: 'RESET' }),
  }), [dispatch]);

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
