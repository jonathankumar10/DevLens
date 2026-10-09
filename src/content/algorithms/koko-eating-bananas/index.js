export default {
  id: 'koko-eating-bananas',
  title: 'Koko Eating Bananas',
  difficulty: 'Medium',
  pattern: 'Binary Search on Answer',
  category: 'binary-search',
  path: '/algorithms/koko-eating-bananas',
  description: 'Koko has n piles of bananas; pile i has piles[i] bananas. Each hour she picks one pile and eats up to k bananas from it. Return the minimum integer speed k that lets her finish every pile within h hours.',
  metaphor: 'We aren\'t searching the piles — we\'re searching the speedometer. Speeds 1…max(piles) form a sorted line: too slow on the left, fast enough on the right. Each guess is tested by timing every pile. Fast enough? Remember it and try slower. Too slow? Speed up.',
  tags: ['binary-search', 'array', 'search-on-answer'],
  problemUrl: 'https://leetcode.com/problems/koko-eating-bananas/',
  problemLabel: 'LeetCode #875',

  solution: {
    approaches: [
      {
        id: 'binary-search',
        label: 'Binary Search on Speed',
        complexity: { time: 'O(n log m)', space: 'O(1)' },
        java: {
          code: `public int minEatingSpeed(int[] piles, int h) {
    int left = 1;
    int right = Arrays.stream(piles).max().getAsInt();
    int result = right;

    while (left <= right) {
        int rate = left + (right - left) / 2;
        long hours = 0;
        for (int pile : piles) {
            hours += (pile + rate - 1) / rate;
        }

        if (hours <= h) {
            result = rate;
            right = rate - 1;
        } else {
            left = rate + 1;
        }
    }

    return result;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2, 3, 4]
            if (step.type === 'fits')     return [7, 8, 9, 10, 13, 14, 15]
            if (step.type === 'too-slow') return [7, 8, 9, 10, 16, 17]
            if (step.type === 'done')     return [21]
            return []
          },
        },
        python: {
          code: `def minEatingSpeed(self, piles: List[int], h: int) -> int:
    left, right = 1, max(piles)
    result = right

    while left <= right:
        rate = left + (right - left) // 2
        hours = 0
        for pile in piles:
            hours += math.ceil(pile / rate)

        if hours <= h:
            result = rate
            right = rate - 1
        else:
            left = rate + 1

    return result`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2, 3]
            if (step.type === 'fits')     return [6, 7, 8, 9, 11, 12, 13]
            if (step.type === 'too-slow') return [6, 7, 8, 9, 14, 15]
            if (step.type === 'done')     return [17]
            return []
          },
        },
      },
    ],
  },
}
