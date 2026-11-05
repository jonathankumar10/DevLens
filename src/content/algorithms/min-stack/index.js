export default {
  id: 'min-stack',
  title: 'Min Stack',
  difficulty: 'Medium',
  pattern: 'Stack',
  category: 'stack',
  description:
    'Design a stack that supports push, pop, top, and retrieving the minimum element — all in O(1) time.',
  metaphor:
    'Picture two shelves side by side. The left shelf holds every item you set down. The right "champion shelf" only gets a new box when the new arrival is lighter than every box already there. Ask for the lightest item at any time and you always just peek the champion shelf\'s top — no searching needed.',
  tags: ['stack', 'design'],
  problemUrl: 'https://leetcode.com/problems/min-stack/',
  problemLabel: 'LeetCode #155',

  solution: {
    approaches: [
      {
        id: 'two-stacks',
        label: 'Two Stacks',
        complexity: { time: 'O(1)', space: 'O(n)' },

        python: {
          code: `def __init__(self):
    self.stack = []
    self.minStack = []

def push(self, val: int) -> None:
    self.stack.append(val)
    if((self.minStack and self.minStack[-1] >= val) or not self.minStack):
        self.minStack.append(val)

def pop(self) -> None:
    val = self.stack.pop()
    if(self.minStack and self.minStack[-1] == val):
        self.minStack.pop()

def top(self) -> int:
    return self.stack[-1]

def getMin(self) -> int:
    return self.minStack[-1]`,
          getHighlightLines(step) {
            if (step.type === 'init')                             return [2, 3]
            if (step.type === 'push' && step.pushedToMin)        return [5, 6, 7, 8]
            if (step.type === 'push' && !step.pushedToMin)       return [5, 6, 7]
            if (step.type === 'pop'  && step.poppedFromMin)      return [10, 11, 12, 13]
            if (step.type === 'pop'  && !step.poppedFromMin)     return [10, 11, 12]
            if (step.type === 'top')                              return [15, 16]
            if (step.type === 'getmin')                           return [18, 19]
            return []
          },
        },

        java: {
          code: `public MinStack() {
    stack = new Stack<>();
    minStack = new Stack<>();
}

public void push(int val) {
    stack.push(val);
    if ((!minStack.isEmpty() && minStack.peek() >= val) || minStack.isEmpty()) {
        minStack.push(val);
    }
}

public void pop() {
    int value = stack.pop();
    if (!minStack.isEmpty() && value == minStack.peek()) {
        minStack.pop();
    }
}

public int top() {
    return stack.peek();
}

public int getMin() {
    if (!minStack.isEmpty()) {
        return minStack.peek();
    }
    return -1;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')                             return [2, 3]
            if (step.type === 'push' && step.pushedToMin)        return [6, 7, 8, 9]
            if (step.type === 'push' && !step.pushedToMin)       return [6, 7, 8]
            if (step.type === 'pop'  && step.poppedFromMin)      return [13, 14, 15, 16]
            if (step.type === 'pop'  && !step.poppedFromMin)     return [13, 14, 15]
            if (step.type === 'top')                              return [20, 21]
            if (step.type === 'getmin')                           return [24, 25, 26]
            return []
          },
        },
      },
    ],
  },
}
