/**
 * Convert an array to a binary tree structure.
 * Standard array-to-tree where left child is at 2*i + 1, right child is at 2*i + 2.
 */
export function arrayToTree(arr) {
  if (!arr || arr.length === 0) return null;

  const nodes = arr.map((val, idx) => {
    if (val === null || val === undefined) return null;
    return { id: idx, value: val, left: null, right: null };
  });

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node) {
      const leftIdx = 2 * i + 1;
      const rightIdx = 2 * i + 2;
      if (leftIdx < nodes.length && nodes[leftIdx]) {
        node.left = nodes[leftIdx];
      }
      if (rightIdx < nodes.length && nodes[rightIdx]) {
        node.right = nodes[rightIdx];
      }
    }
  }

  // Return both the root and the flat list of nodes for easier rendering calculations
  return { root: nodes[0], nodes };
}

/**
 * Generate inorder traversal steps from a flat array.
 */
export function generateBinaryTreeSteps(arr) {
  const treeData = arrayToTree(arr);
  const steps = [];
  const visitedNodes = []; // stores values
  const visitedIds = []; // stores node IDs

  if (!treeData || !treeData.root) return steps;

  function traverse(node) {
    if (!node) return;

    // 1. Arrive at node
    steps.push({
      line: 8,
      action: 'arrive',
      data: {
        currentNode: node.value,
        currentNodeId: node.id,
        visitedNodes: [...visitedNodes],
        visitedIds: [...visitedIds],
        message: `Arrived at node ${node.value}. Going to left child...`,
        tree: treeData
      },
      stateSnapshot: {
        variables: { current: node.value, visited: `[${visitedNodes.join(', ')}]` },
        callStack: [`inorder(${node.value})`]
      }
    });

    traverse(node.left);

    // 2. Process node (inorder)
    visitedNodes.push(node.value);
    visitedIds.push(node.id);
    
    steps.push({
      line: 10,
      action: 'process',
      data: {
        currentNode: node.value,
        currentNodeId: node.id,
        visitedNodes: [...visitedNodes],
        visitedIds: [...visitedIds],
        message: `Processing node ${node.value}. Adding to visited list.`,
        tree: treeData
      },
      stateSnapshot: {
        variables: { current: node.value, visited: `[${visitedNodes.join(', ')}]` },
        callStack: [`inorder(${node.value})`]
      }
    });

    // 3. Go right
    steps.push({
      line: 10,
      action: 'go_right',
      data: {
        currentNode: node.value,
        currentNodeId: node.id,
        visitedNodes: [...visitedNodes],
        visitedIds: [...visitedIds],
        message: `Going to right child of node ${node.value}...`,
        tree: treeData
      },
      stateSnapshot: {
        variables: { current: node.value, visited: `[${visitedNodes.join(', ')}]` },
        callStack: [`inorder(${node.value})`]
      }
    });

    traverse(node.right);

    // 4. Leave node
    steps.push({
      line: 10,
      action: 'leave',
      data: {
        currentNode: node.value,
        currentNodeId: node.id,
        visitedNodes: [...visitedNodes],
        visitedIds: [...visitedIds],
        message: `Finished with node ${node.value}. Returning up the tree.`,
        tree: treeData
      },
      stateSnapshot: {
        variables: { current: node.value, visited: `[${visitedNodes.join(', ')}]` },
        callStack: [`inorder(${node.value})`]
      }
    });
  }

  // Initial step
  steps.push({
    line: 12,
    action: 'init',
    data: {
      currentNode: null,
      currentNodeId: null,
      visitedNodes: [],
      visitedIds: [],
      message: 'Starting Inorder Traversal',
      tree: treeData
    },
    stateSnapshot: {
      variables: { current: 'null', visited: '[]' },
      callStack: ['main()']
    }
  });

  traverse(treeData.root);

  // Final step
  steps.push({
    line: 12,
    action: 'end',
    data: {
      currentNode: null,
      currentNodeId: null,
      visitedNodes: [...visitedNodes],
      visitedIds: [...visitedIds],
      message: 'Inorder Traversal Complete!',
      tree: treeData
    },
    stateSnapshot: {
      variables: { current: 'null', visited: `[${visitedNodes.join(', ')}]` },
      callStack: ['main()']
    }
  });

  // Print step
  steps.push({
    line: 13,
    action: 'print',
    data: {
      currentNode: null,
      currentNodeId: null,
      visitedNodes: [...visitedNodes],
      visitedIds: [...visitedIds],
      message: 'Printing completion message...',
      tree: treeData,
      output: '[stdout] Tree inorder traversal complete!'
    },
    stateSnapshot: {
      variables: { current: 'null', visited: `[${visitedNodes.join(', ')}]` },
      callStack: ['main()']
    }
  });

  return steps;
}
