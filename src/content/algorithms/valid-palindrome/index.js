export default {
  id: 'valid-palindrome',
  title: 'Valid Palindrome',
  difficulty: 'Easy',
  pattern: 'Two Pointers',
  category: 'two-pointers',
  path: '/algorithms/valid-palindrome',
  description: 'Given a string, determine if it is a palindrome after converting all uppercase letters to lowercase and removing all non-alphanumeric characters.',
  metaphor: 'Two readers start at opposite ends of the string and walk toward each other. Anyone who lands on punctuation or whitespace steps past it without saying a word. When both land on a letter or digit, they compare — a mismatch ends the story immediately; a match lets them both step inward.',
  tags: ['two-pointers', 'string'],
  problemUrl: 'https://leetcode.com/problems/valid-palindrome/',
  problemLabel: 'LeetCode #125',

  solution: {
    approaches: [
      {
        id: 'two-pointers',
        label: 'Two Pointers',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public boolean isPalindrome(String s) {
    int left = 0;
    int right = s.length() - 1;

    while (left < right) {
        if (!Character.isLetterOrDigit(s.charAt(left))) {
            left++;
        } else if (!Character.isLetterOrDigit(s.charAt(right))) {
            right--;
        } else {
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
    }

    return true;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')       return [2, 3]
            if (step.type === 'skip-left')  return [6, 7]
            if (step.type === 'skip-right') return [8, 9]
            if (step.type === 'mismatch')   return [11, 12]
            if (step.type === 'match')      return [14, 15]
            if (step.type === 'valid')      return [19]
            return []
          },
        },
        python: {
          code: `def isPalindrome(self, s: str) -> bool:
    left = 0
    right = len(s) - 1

    while left < right:
        if not s[left].isalnum():
            left += 1
        elif not s[right].isalnum():
            right -= 1
        else:
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1

    return True`,
          getHighlightLines(step) {
            if (step.type === 'init')       return [2, 3]
            if (step.type === 'skip-left')  return [6, 7]
            if (step.type === 'skip-right') return [8, 9]
            if (step.type === 'mismatch')   return [11, 12]
            if (step.type === 'match')      return [13, 14]
            if (step.type === 'valid')      return [16]
            return []
          },
        },
      },
    ],
  },
}
