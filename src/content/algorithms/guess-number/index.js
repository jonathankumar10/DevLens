export default {
  id: 'guess-number',
  title: 'Guess Number Higher or Lower',
  difficulty: 'Easy',
  pattern: 'Binary Search',
  category: 'binary-search',
  description: 'You are playing a number guessing game. I pick a number from 1 to n. Each round you call guess(num) — it returns -1 if your guess is too high, 1 if too low, or 0 if correct. Find the picked number efficiently.',
  metaphor: 'Picture a hallway of numbered doors, 1 through n. Behind exactly one is a prize. You knock on the middle door — a voice replies "Too High!", "Too Low!", or "You got it!". Doors outside your current window are chalked off. Each reply halves your search.',
  tags: ['binary-search'],
  problemUrl: 'https://leetcode.com/problems/guess-number-higher-or-lower/',
  problemLabel: 'LeetCode #374',

  solution: {
    approaches: [
      {
        id: 'binary-search',
        label: 'Binary Search',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        python: {
          code: `def guessNumber(self, n: int) -> int:
    left = 1
    right = n
    while left <= right:
        mid = left + (right - left) // 2
        result = guess(mid)
        if result == 0:
            return mid
        elif result == -1:
            right = mid - 1
        else:
            left = mid + 1
    return -1`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2, 3]
            if (step.type === 'guess')    return [5, 6]
            if (step.type === 'found')    return [7, 8]
            if (step.type === 'too-high') return [9, 10]
            if (step.type === 'too-low')  return [11, 12]
            return []
          },
        },
        java: {
          code: `public int guessNumber(int n) {
    int left = 1;
    int right = n;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        int result = guess(mid);
        if (result == 0) {
            return mid;
        } else if (result == -1) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return -1;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2, 3]
            if (step.type === 'guess')    return [5, 6]
            if (step.type === 'found')    return [7, 8]
            if (step.type === 'too-high') return [9, 10]
            if (step.type === 'too-low')  return [11, 12]
            return []
          },
        },
      },
    ],
  },
}
