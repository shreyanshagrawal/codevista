/**
 * Generates visualization steps for simulating a recursive function using a stack.
 * Simulates factorial(n) as an example.
 * 
 * @param {number} n - The input number for the factorial function.
 * @returns {Array} - Array of steps showing stack frame pushes and pops.
 */
export function generateRecursionSteps(n) {
  const steps = [];
  const stack = [];

  function recordStep(line, action, message, currentFrame, returnedValue = null) {
    // We deep clone the stack so each step holds its exact state snapshot
    steps.push({
      line,
      action,
      data: {
        stack: JSON.parse(JSON.stringify(stack)),
        currentFrame: { ...currentFrame },
        returnedValue,
        message,
      },
      stateSnapshot: {
        variables: { 
          n: currentFrame.n, 
          result: returnedValue !== null ? returnedValue : '?' 
        },
        callStack: stack.map(f => `factorial(${f.n})`).reverse()
      }
    });
  }

  function simulateFactorial(num) {
    // 1. Push frame
    const frame = { id: `frame-${num}`, n: num, status: 'calling' };
    stack.push(frame);

    recordStep(4, 'push', `Calling factorial(${num}). Pushing onto stack.`, frame);

    let result;
    if (num <= 1) {
      // 2. Base case
      frame.status = 'base_case';
      recordStep(3, 'base_case', `Base case reached! factorial(${num}) = 1.`, frame);
      result = 1;
    } else {
      // 3. Recursive wait
      frame.status = 'waiting';
      recordStep(4, 'waiting', `To compute factorial(${num}), we first need factorial(${num - 1}).`, frame);
      
      const childResult = simulateFactorial(num - 1);
      
      // 4. Compute
      frame.status = 'computing';
      result = num * childResult;
      recordStep(4, 'computing', `Received ${childResult} from child. Computing: ${num} * ${childResult} = ${result}.`, frame, childResult);
    }

    // 5. Pop frame
    stack.pop();
    frame.status = 'returning';
    recordStep(4, 'pop', `Returning ${result}. Popping factorial(${num}) from stack.`, frame, result);
    
    return result;
  }

  // Initial setup step
  steps.push({
    line: 6,
    action: 'init',
    data: {
      stack: [],
      currentFrame: null,
      returnedValue: null,
      message: `Starting recursive simulation for factorial(${n})`
    },
    stateSnapshot: {
      variables: {},
      callStack: []
    }
  });

  // Kick off recursion
  const finalAns = simulateFactorial(Math.max(1, Math.min(n, 12))); // limit to avoid huge stacks

  // Final wrap-up step
  steps.push({
    line: 6,
    action: 'end',
    data: {
      stack: [],
      currentFrame: null,
      returnedValue: finalAns,
      message: `Recursion complete! Final answer is ${finalAns}.`
    },
    stateSnapshot: {
      variables: { finalResult: finalAns },
      callStack: []
    }
  });

  // Print final answer step
  steps.push({
    line: 7,
    action: 'print',
    data: {
      stack: [],
      currentFrame: null,
      returnedValue: finalAns,
      message: 'Printing final answer...',
      output: `[stdout] ${finalAns}`
    },
    stateSnapshot: {
      variables: { finalResult: finalAns },
      callStack: []
    }
  });

  return steps;
}
