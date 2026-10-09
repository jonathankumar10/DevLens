export default {
  id: 'first-bad-version',
  title: 'First Bad Version',
  difficulty: 'Easy',
  pattern: 'Binary Search',
  category: 'binary-search',
  path: '/algorithms/first-bad-version',
  description: 'You have versions 1..n, and once a version is bad every later version is bad too. Given an API isBadVersion(version), find the first bad version while minimizing the number of API calls.',
  metaphor: 'The versions form a line of green lights followed by red lights, and we need the first red. Each API call tests the midpoint: red means the first red is here or earlier, green means it\'s strictly later. Every call halves the line, so even a billion versions take about 30 calls.',
  tags: ['binary-search', 'interactive'],
  problemUrl: 'https://leetcode.com/problems/first-bad-version/',
  problemLabel: 'LeetCode #278',

  solution: {
    approaches: [
      {
        id: 'binary-search',
        label: 'Binary Search',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        java: {
          code: `public int firstBadVersion(int n) {
    int left = 1;
    int right = n;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (isBadVersion(mid)) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }

    return left;
}`,
          getHighlightLines(step) {
            if (step.type === 'init') return [2, 3]
            if (step.type === 'bad')  return [6, 7, 8]
            if (step.type === 'good') return [6, 9, 10]
            if (step.type === 'done') return [14]
            return []
          },
        },
        python: {
          code: `def firstBadVersion(self, n: int) -> int:
    left, right = 1, n

    while left <= right:
        mid = left + (right - left) // 2
        if isBadVersion(mid):
            right = mid - 1
        else:
            left = mid + 1

    return left`,
          getHighlightLines(step) {
            if (step.type === 'init') return [2]
            if (step.type === 'bad')  return [5, 6, 7]
            if (step.type === 'good') return [5, 8, 9]
            if (step.type === 'done') return [11]
            return []
          },
        },
      },
    ],
  },
}
