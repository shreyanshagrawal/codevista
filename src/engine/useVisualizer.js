import { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatTimestamp } from '../utils/formatters';
import { parseToGraph, buildExecutionSteps, validateSyntax } from './executionEngine';
import { generateLinkedListTraversalSteps } from './linkedListEngine';
import { generateBinaryTreeSteps } from './binaryTreeEngine';
import { generateRecursionSteps } from './recursionEngine';

/**
 * Custom hook that drives the visualization playback engine.
 * Returns controls (run, pause, step, reset) and the current graph.
 */
export function useVisualizer() {
  const { state, actions } = useAppStore();
  const timerRef = useRef(null);

  const initialStepRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    actions.reset();
    actions.setSyntaxError(null);
  }, [clearTimer, actions]);

  const generateSteps = useCallback(() => {
    actions.clearDebug();
    actions.reset();
    actions.setSyntaxError(null);

    const validation = validateSyntax(state.code);
    if (!validation.valid) {
      actions.setSyntaxError({ line: validation.line, message: validation.message });
      actions.appendDebug({ type: 'error', time: formatTimestamp(), text: `Syntax Error at line ${validation.line}: ${validation.message}` });
      actions.setVisualizationData({ nodes: [], edges: [] });
      actions.setStepsData([]);
      actions.setTotalSteps(0);
      return { g: { nodes: [], edges: [] }, s: [] };
    }

    let g = null;
    let s = [];

    // Attempt to parse input array from code editor
    let arr = [10, 20, 30, 40, 50, 60, 70];
    try {
      // Find the first array that actually contains numbers
      const match = state.code.match(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/);
      if (match) arr = JSON.parse(match[0]);
    } catch (e) {
      // fallback to default
    }

    try {
      if (state.algorithmMode === 'linkedList') {
        s = generateLinkedListTraversalSteps(arr);
        g = { nodes: [], edges: [] };
      } else if (state.algorithmMode === 'binaryTree') {
        s = generateBinaryTreeSteps(arr);
        g = { nodes: [], edges: [] };
      } else if (state.algorithmMode === 'recursion') {
        // Look for a number inside factorial(n) or just use the first item in array
        let n = arr.length > 0 ? arr[0] : 5;
        try {
          const numMatch = state.code.match(/factorial\((\d+)\)/);
          if (numMatch) n = parseInt(numMatch[1], 10);
        } catch(e) {}
        
        // Keep it reasonable to prevent infinite loops
        n = Math.max(1, Math.min(n, 12));
        s = generateRecursionSteps(n);
        g = { nodes: [], edges: [] };
      } else if (state.algorithmMode === 'general') {
        g = parseToGraph(state.code);
        s = buildExecutionSteps(g);
      } else {
        s = [];
        g = { nodes: [], edges: [] };
      }
    } catch (error) {
      actions.appendDebug({ type: 'error', time: formatTimestamp(), text: error.message || String(error) });
      s = [];
      g = { nodes: [], edges: [] };
    }
    
    actions.setVisualizationData(g);
    actions.setStepsData(s);
    actions.setTotalSteps(s.length);

    return { g, s };
  }, [state.code, state.algorithmMode, actions]);

  const play = useCallback(() => {
    // If we haven't generated steps yet, do it now
    let currentSteps = state.steps;
    if (!currentSteps || currentSteps.length === 0) {
      const { s } = generateSteps();
      currentSteps = s;
    }
    
    initialStepRef.current = state.currentStep;
    actions.setIsPlaying(true);
  }, [state.steps, state.currentStep, generateSteps, actions]);

  const pause = useCallback(() => {
    actions.setIsPlaying(false);
  }, [actions]);

  // Effect to handle the playback loop
  useEffect(() => {
    if (!state.isPlaying) return;

    let currentSteps = state.steps;
    if (!currentSteps || currentSteps.length === 0) return;

    const stepIndex = state.currentStep;
    
    if (stepIndex >= currentSteps.length) {
      actions.setIsPlaying(false);
      return;
    }

    const interval = Math.round(1200 / state.speed);

    timerRef.current = setTimeout(() => {
      const step = currentSteps[stepIndex];
      
      // BREAKPOINT CHECK
      if (stepIndex > initialStepRef.current && state.breakpoints.has(step.line)) {
        actions.setIsPlaying(false);
        return;
      }

      // advance to next step
      actions.setCurrentStep(stepIndex + 1);
      actions.setActiveNode(step.data.nodeId);

      if (step.data.output) {
        actions.appendDebug({ type: 'log', time: formatTimestamp(), text: step.data.output });
      }

    }, interval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    state.isPlaying, 
    state.speed, 
    state.currentStep, 
    state.steps, 
    state.breakpoints, 
    actions
  ]);

  const nextStep = useCallback(() => {
    let currentSteps = state.steps;
    if (!currentSteps || currentSteps.length === 0) {
      const { s } = generateSteps();
      currentSteps = s;
    }
    
    const idx = state.currentStep;
    if (idx >= currentSteps.length) return;
    
    const step = currentSteps[idx];
    actions.setCurrentStep(idx + 1);
    actions.setActiveNode(step.data.nodeId);
    if (step.data.output) {
      actions.appendDebug({ type: 'log', time: formatTimestamp(), text: step.data.output });
    }
  }, [state.steps, state.currentStep, generateSteps, actions]);

  const prevStep = useCallback(() => {
    if (!state.steps || state.steps.length === 0) return;
    
    const idx = state.currentStep - 2; // -1 for previous, -1 because we advanced after execution
    if (idx < 0) {
      reset();
      return;
    }
    const step = state.steps[idx];
    actions.setCurrentStep(idx + 1);
    actions.setActiveNode(step.data.nodeId);
  }, [state.steps, state.currentStep, actions, reset]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { 
    graph: state.visualizationData, 
    steps: state.steps, 
    play, 
    pause, 
    generateSteps, 
    next: nextStep, 
    prev: prevStep, 
    reset 
  };
}
