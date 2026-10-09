export default {
  id: 'next-greatest-letter',
  title: 'Find Smallest Letter Greater Than Target',
  difficulty: 'Easy',
  pattern: 'Binary Search',
  category: 'binary-search',
  path: '/algorithms/next-greatest-letter',
  description: 'Given a sorted array of characters letters and a character target, return the smallest character in letters that is lexicographically greater than target. If no such character exists, wrap around and return letters[0].',
  metaphor: 'We hunt for the boundary between "≤ target" and "> target". Every midpoint that is too small pushes left past it; every midpoint that is big enough becomes a candidate and pulls right in. When the window collapses, left sits exactly on the first letter past the boundary — or falls off the end, which means wrap around.',
  tags: ['binary-search', 'array'],
  problemUrl: 'https://leetcode.com/problems/find-smallest-letter-greater-than-target/',
  problemLabel: 'LeetCode #744',

  solution: {
    approaches: [
      {
        id: 'binary-search',
        label: 'Binary Search',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        java: {
          code: `public char nextGreatestLetter(char[] letters, char target) {
    int left = 0;
    int right = letters.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (letters[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return left == letters.length ? letters[0] : letters[left];
}`,
          getHighlightLines(step) {
            if (step.type === 'init')       return [2, 3]
            if (step.type === 'go-right')   return [6, 7, 8]
            if (step.type === 'go-left')    return [6, 9, 10]
            if (step.type === 'done')       return [14]
            return []
          },
        },
        python: {
          code: `def nextGreatestLetter(self, letters: List[str], target: str) -> str:
    left, right = 0, len(letters) - 1

    while left <= right:
        mid = left + (right - left) // 2
        if letters[mid] <= target:
            left = mid + 1
        else:
            right = mid - 1

    return letters[left] if left < len(letters) else letters[0]`,
          getHighlightLines(step) {
            if (step.type === 'init')       return [2]
            if (step.type === 'go-right')   return [5, 6, 7]
            if (step.type === 'go-left')    return [5, 8, 9]
            if (step.type === 'done')       return [11]
            return []
          },
        },
      },
    ],
  },
}
