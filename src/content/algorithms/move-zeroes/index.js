export default {
  id: 'move-zeroes',
  title: 'Move Zeroes',
  difficulty: 'Easy',
  pattern: 'Two Pointers',
  category: 'two-pointers',
  path: '/algorithms/move-zeroes',
  description: 'Given an integer array nums, move all 0s to the end while keeping the relative order of the non-zero elements. Do it in-place without making a copy of the array.',
  metaphor: 'A scout (i) walks the whole line while a placeholder (left) marks the next free front-row seat. Every time the scout finds a non-zero, it swaps it into that seat and the placeholder moves up one. Zeros get pushed backward naturally — nobody ever has to look for them.',
  tags: ['two-pointers', 'array', 'in-place'],
  problemUrl: 'https://leetcode.com/problems/move-zeroes/',
  problemLabel: 'LeetCode #283',

  solution: {
    approaches: [
      {
        id: 'swap',
        label: 'Swap Forward',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public void moveZeroes(int[] nums) {
    int left = 0;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] != 0) {
            int temp = nums[i];
            nums[i] = nums[left];
            nums[left] = temp;
            left++;
        }
    }
}`,
          getHighlightLines(step) {
            if (step.type === 'init') return [2]
            if (step.type === 'zero') return [3, 4]
            if (step.type === 'swap') return [4, 5, 6, 7, 8]
            if (step.type === 'done') return [11]
            return []
          },
        },
        python: {
          code: `def moveZeroes(self, nums: List[int]) -> None:
    left = 0
    for i in range(len(nums)):
        if nums[i] != 0:
            nums[left], nums[i] = nums[i], nums[left]
            left += 1`,
          getHighlightLines(step) {
            if (step.type === 'init') return [2]
            if (step.type === 'zero') return [3, 4]
            if (step.type === 'swap') return [4, 5, 6]
            if (step.type === 'done') return [3]
            return []
          },
        },
      },
    ],
  },
}
