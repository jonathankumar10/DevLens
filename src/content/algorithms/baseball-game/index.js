export default {
  id: 'baseball-game',
  title: 'Baseball Game',
  difficulty: 'Easy',
  pattern: 'Stack',
  category: 'stack',
  description: 'Given a list of operations, calculate the total score of a baseball game. Operations: an integer (new score), "+" (sum of last two), "D" (double of last), "C" (cancel last). Return the total of all scores on record.',
  metaphor: 'Picture a stack of scorecards on a table. Each number places a new card on top. "D" reads the top card and doubles it onto a new card. "+" peeks at the top two, writes their sum on a new card. "C" crumples and discards the top card. At the end every card on the stack is tallied.',
  tags: ['stack'],
  problemUrl: 'https://leetcode.com/problems/baseball-game/',
  problemLabel: 'LeetCode #682',

  solution: {
    approaches: [
      {
        id: 'stack',
        label: 'Stack',
        complexity: { time: 'O(n)', space: 'O(n)' },
        java: {
          code: `public int calPoints(String[] operations) {
    int result = 0;
    Stack<Integer> stack = new Stack<>();
    for (String op : operations) {
        if (op.equals("+")) {
            int first = stack.pop();
            int second = first + stack.peek();
            stack.push(first);
            stack.push(second);
        } else if (op.equals("C")) {
            stack.pop();
        } else if (op.equals("D")) {
            int value = stack.peek() * 2;
            stack.push(value);
        } else {
            stack.push(Integer.parseInt(op));
        }
    }
    System.out.println(stack);
    for (int value : stack) {
        result = result + value;
    }
    return result;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')   return [2, 3]
            if (step.type === 'num')    return [4, 15, 16]
            if (step.type === 'plus')   return [4, 5, 6, 7, 8, 9]
            if (step.type === 'cancel') return [4, 10, 11]
            if (step.type === 'double') return [4, 12, 13, 14]
            if (step.type === 'sum')    return [19, 20, 21, 23]
            return []
          },
        },
        python: {
          code: `def calPoints(self, operations: List[str]) -> int:
    stack = []
    result = 0

    for op in operations:
        if op == "+":
            stack.append(stack[-1] + stack[-2])
        elif op == "C":
            stack.pop()
        elif op == "D":
            stack.append(2 * stack[-1])
        else:
            stack.append(int(op))

    print(stack)
    for value in stack:
        result += value

    return result`,
          getHighlightLines(step) {
            if (step.type === 'init')   return [2, 3]
            if (step.type === 'num')    return [5, 12, 13]
            if (step.type === 'plus')   return [5, 6, 7]
            if (step.type === 'cancel') return [5, 8, 9]
            if (step.type === 'double') return [5, 10, 11]
            if (step.type === 'sum')    return [15, 16, 17, 19]
            return []
          },
        },
      },
    ],
  },
}
