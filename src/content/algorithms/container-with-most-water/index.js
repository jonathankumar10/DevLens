export default {
  id: 'container-with-most-water',
  title: 'Container With Most Water',
  difficulty: 'Medium',
  pattern: 'Two Pointers',
  category: 'two-pointers',
  path: '/algorithms/container-with-most-water',
  description: 'Given n vertical lines where line i has height heights[i], find two lines that, together with the x-axis, form a container holding the most water. Return that maximum amount of water.',
  metaphor: 'Start with the widest possible container — the two outermost walls. Water level is capped by the shorter wall, so moving the taller wall inward can never help: width shrinks and the cap stays. The only hope for more water is to replace the shorter wall, so that\'s the pointer we move.',
  tags: ['two-pointers', 'array', 'greedy'],
  problemUrl: 'https://leetcode.com/problems/container-with-most-water/',
  problemLabel: 'LeetCode #11',

  solution: {
    approaches: [
      {
        id: 'two-pointers',
        label: 'Two Pointers',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int maxArea(int[] heights) {
    int max = 0;
    int left = 0;
    int right = heights.length - 1;

    while (left < right) {
        int area = Math.min(heights[left], heights[right]) * (right - left);
        max = Math.max(max, area);

        if (heights[left] < heights[right]) {
            left++;
        } else {
            right--;
        }
    }

    return max;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')       return [2, 3, 4]
            if (step.type === 'move-left')  return [7, 8, 10, 11]
            if (step.type === 'move-right') return [7, 8, 12, 13]
            if (step.type === 'done')       return [17]
            return []
          },
        },
        python: {
          code: `def maxArea(self, heights: List[int]) -> int:
    max_area = 0
    left, right = 0, len(heights) - 1

    while left < right:
        area = min(heights[left], heights[right]) * (right - left)
        max_area = max(area, max_area)

        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1

    return max_area`,
          getHighlightLines(step) {
            if (step.type === 'init')       return [2, 3]
            if (step.type === 'move-left')  return [6, 7, 9, 10]
            if (step.type === 'move-right') return [6, 7, 11, 12]
            if (step.type === 'done')       return [14]
            return []
          },
        },
      },
    ],
  },
}
