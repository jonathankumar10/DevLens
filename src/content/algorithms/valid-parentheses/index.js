export default {
  id: 'valid-parentheses',
  title: 'Valid Parentheses',
  difficulty: 'Easy',
  pattern: 'Stack',
  category: 'stack',
  description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. Open brackets must be closed by the same type and in the correct order.',
  metaphor: 'Picture a ticket-stub checker at nested gates. Every opening gate hands you a stub — you stack them up. At each closing gate you must present the matching stub from the top of your pile. Wrong stub or no stub means the path is blocked. Leftover stubs when all gates are passed also means invalid.',
  tags: ['stack', 'string'],
  problemUrl: 'https://leetcode.com/problems/valid-parentheses/',
  problemLabel: 'LeetCode #20',

  solution: {
    approaches: [
      {
        id: 'stack',
        label: 'Stack',
        complexity: { time: 'O(n)', space: 'O(n)' },
        java: {
          code: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    HashMap<Character, Character> map = new HashMap<>();
    map.put('{', '}');
    map.put('[', ']');
    map.put('(', ')');
    char[] sArray = s.toCharArray();
    for (char c : sArray) {
        if (c == '{' || c == '[' || c == '(') {
            stack.push(c);
        } else {
            if (!stack.isEmpty()) {
                char value = stack.pop();
                if (map.get(value) == c) {
                    continue;
                } else {
                    return false;
                }
            } else if (c == ']' || c == '}' || c == ')') {
                return false;
            }
        }
    }
    return stack.isEmpty();
}`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2, 3, 4, 5, 6, 7]
            if (step.type === 'push')     return [8, 9, 10]
            if (step.type === 'match')    return [8, 11, 12, 13, 14, 15]
            if (step.type === 'mismatch') return [8, 11, 12, 13, 14, 16, 17]
            if (step.type === 'orphan')   return [8, 11, 12, 19, 20]
            if (step.type === 'valid')    return [24]
            if (step.type === 'invalid')  return [24]
            return []
          },
        },
        python: {
          code: `def isValid(self, s: str) -> bool:
    stack = []
    mapOfParenthesis = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if(c == "{" or c == "[" or c == "("):
            stack.append(c)
        else:
            if(stack):
                if stack[-1] != mapOfParenthesis[c]:
                    return False
                else:
                    stack.pop()
            elif ((c == ']' or c == '}' or c == ')')):
                return False
    if stack:
        return False
    else:
        return True`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2, 3]
            if (step.type === 'push')     return [4, 5, 6]
            if (step.type === 'match')    return [4, 7, 8, 9, 11, 12]
            if (step.type === 'mismatch') return [4, 7, 8, 9, 10]
            if (step.type === 'orphan')   return [4, 7, 8, 13, 14]
            if (step.type === 'valid')    return [15, 17, 18]
            if (step.type === 'invalid')  return [15, 16]
            return []
          },
        },
      },
    ],
  },
}
