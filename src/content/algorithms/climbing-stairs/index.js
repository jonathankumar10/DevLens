export default {
  id: 'climbing-stairs',
  title: 'Climbing Stairs',
  difficulty: 'Easy',
  pattern: '1-D Dynamic Programming',
  category: '1d-dp',
  path: '/algorithms/climbing-stairs',
  description: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you reach the top?',
  metaphor: 'To stand on stair i, your last move came either from stair i−1 (a 1-step) or stair i−2 (a 2-step). So the ways to reach i are the ways to reach i−1 plus the ways to reach i−2 — the Fibonacci sequence. We only ever need the last two answers, so two variables walk up the staircase together.',
  tags: ['dynamic-programming', 'fibonacci', 'math'],
  problemUrl: 'https://leetcode.com/problems/climbing-stairs/',
  problemLabel: 'LeetCode #70',

  solution: {
    approaches: [
      {
        id: 'two-variables',
        label: 'Bottom-Up (O(1) space)',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int climbStairs(int n) {
    if (n <= 2) {
        return n;
    }

    int p1 = 1;
    int p2 = 2;
    for (int i = 3; i <= n; i++) {
        int res = p1 + p2;
        p1 = p2;
        p2 = res;
    }

    return p2;
}`,
          getHighlightLines(step) {
            if (step.type === 'small') return [2, 3]
            if (step.type === 'init')  return [6, 7]
            if (step.type === 'step')  return [8, 9, 10, 11]
            if (step.type === 'done')  return [14]
            return []
          },
        },
        python: {
          code: `def climbStairs(self, n: int) -> int:
    if n <= 2:
        return n

    p1, p2 = 1, 2
    for i in range(3, n + 1):
        p1, p2 = p2, p1 + p2

    return p2`,
          getHighlightLines(step) {
            if (step.type === 'small') return [2, 3]
            if (step.type === 'init')  return [5]
            if (step.type === 'step')  return [6, 7]
            if (step.type === 'done')  return [9]
            return []
          },
        },
      },
    ],
  },
}
