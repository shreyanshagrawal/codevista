/**
 * Generates visualization steps for traversing a linked list.
 * 
 * @param {Array} values - Array of values representing the linked list nodes.
 * @returns {Array} - Array of steps showing the traversal process.
 */
export function generateLinkedListTraversalSteps(values) {
  const steps = [];
  
  if (!values || !Array.isArray(values) || values.length === 0) {
    return steps;
  }

  const currentList = [];

  // Init step
  steps.push({
    line: 22,
    action: 'init',
    data: {
      listValues: [],
      currentNode: null,
      pointerPosition: 'null',
      activeNodeIndex: -1,
      message: `Created an empty LinkedList.`
    },
    stateSnapshot: {
       variables: { ll: '[]', values: `[${values.join(', ')}]` },
       callStack: ['main()']
    }
  });

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    
    // Visit append loop
    steps.push({
      line: 23,
      action: 'loop',
      data: {
        listValues: [...currentList],
        currentNode: null,
        pointerPosition: 'null',
        activeNodeIndex: -1,
        message: `Next value to append: ${val}`
      },
      stateSnapshot: {
        variables: { val: String(val) },
        callStack: ['main()']
      }
    });

    // Call append
    steps.push({
      line: 24,
      action: 'call_append',
      data: {
        listValues: [...currentList],
        currentNode: null,
        pointerPosition: 'null',
        activeNodeIndex: -1,
        message: `Calling ll.append(${val})`
      },
      stateSnapshot: {
        variables: { data: String(val) },
        callStack: [`append(${val})`, 'main()']
      }
    });

    if (currentList.length === 0) {
       // Append to head
       currentList.push(val);
       steps.push({
         line: 13,
         action: 'append_head',
         data: {
           listValues: [...currentList],
           currentNode: val,
           pointerPosition: 0,
           activeNodeIndex: 0,
           message: `List is empty. Set head to new node ${val}.`
         },
         stateSnapshot: {
           variables: { 'self.head': `Node(${val})` },
           callStack: [`append(${val})`, 'main()']
         }
       });
    } else {
       // Start at head
       steps.push({
         line: 15,
         action: 'traverse',
         data: {
           listValues: [...currentList],
           currentNode: currentList[0],
           pointerPosition: 0,
           activeNodeIndex: 0,
           message: `curr = self.head`
         },
         stateSnapshot: {
           variables: { curr: `Node(${currentList[0]})` },
           callStack: [`append(${val})`, 'main()']
         }
       });

       // Traverse to tail
       for (let j = 0; j < currentList.length; j++) {
          steps.push({
             line: 16,
             action: 'traverse',
             data: {
               listValues: [...currentList],
               currentNode: currentList[j],
               pointerPosition: j,
               activeNodeIndex: j,
               message: `Checking if curr.next exists...`
             },
             stateSnapshot: {
               variables: { curr: `Node(${currentList[j]})` },
               callStack: [`append(${val})`, 'main()']
             }
          });

          if (j < currentList.length - 1) {
             steps.push({
               line: 17,
               action: 'move_pointer',
               data: {
                 listValues: [...currentList],
                 currentNode: currentList[j],
                 pointerPosition: j + 0.5,
                 activeNodeIndex: j,
                 message: `Moving curr pointer to next node...`
               },
               stateSnapshot: {
                 variables: { curr: `Node(${currentList[j]}).next` },
                 callStack: [`append(${val})`, 'main()']
               }
             });
             
             steps.push({
               line: 17,
               action: 'move_pointer',
               data: {
                 listValues: [...currentList],
                 currentNode: currentList[j+1],
                 pointerPosition: j + 1,
                 activeNodeIndex: j + 1,
                 message: `curr is now Node(${currentList[j+1]})`
               },
               stateSnapshot: {
                 variables: { curr: `Node(${currentList[j+1]})` },
                 callStack: [`append(${val})`, 'main()']
               }
             });
          }
       }

       // Reached tail, now append
       currentList.push(val);
       steps.push({
         line: 18,
         action: 'append_tail',
         data: {
           listValues: [...currentList],
           currentNode: val,
           pointerPosition: currentList.length - 1,
           activeNodeIndex: currentList.length - 1,
           message: `Reached tail. Attached new node ${val}.`
         },
         stateSnapshot: {
           variables: { 'curr.next': `Node(${val})` },
           callStack: [`append(${val})`, 'main()']
         }
       });
    }
  }

  // Final State Step
  steps.push({
    line: 25,
    action: 'end',
    data: {
      listValues: [...currentList],
      currentNode: null,
      pointerPosition: 'null',
      activeNodeIndex: -1,
      message: 'Finished appending all values!'
    },
    stateSnapshot: {
      callStack: ['main()'],
      variables: { }
    }
  });

  // Print Step
  steps.push({
    line: 26,
    action: 'print',
    data: {
      listValues: [...currentList],
      currentNode: null,
      pointerPosition: 'null',
      activeNodeIndex: -1,
      message: 'Printing success message...',
      output: '[stdout] Linked list created successfully!'
    },
    stateSnapshot: {
      callStack: ['main()'],
      variables: { }
    }
  });

  return steps;
}
