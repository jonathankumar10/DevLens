export default {
  id: 'find-min-rotated',
  title: 'Find Minimum in Rotated Sorted Array',
  difficulty: 'Medium',
  pattern: 'Binary Search',
  category: 'binary-search',
  path: '/algorithms/find-min-rotated',
  description: 'A sorted array of unique integers has been rotated between 1 and n times (e.g. [0,1,2,4,5,6,7] → [4,5,6,7,0,1,2]). Return the minimum element in O(log n) time.',
  metaphor: 'A rotated array is two sorted staircases glued together, and the minimum is the bottom of the drop. Compare the middle step to the rightmost step: if mid is higher, the drop must be to its right. If mid is lower, mid is already on the lower staircase — the minimum is mid or somewhere to its left.',
  tags: ['binary-search', 'array'],
  problemUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
  problemLabel: 'LeetCode #153',

  solution: {
    approaches: [
      {
        id: 'binary-search',
        label: 'Binary Search',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        java: {
          code: `public int findMin(int[] nums) {
    int left = 0;
    int right = nums.length - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return nums[left];
}`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2, 3]
            if (step.type === 'go-right') return [6, 7, 8]
            if (step.type === 'go-left')  return [6, 9, 10]
            if (step.type === 'done')     return [14]
            return []
          },
        },
        python: {
          code: `def findMin(self, nums: List[int]) -> int:
    left, right = 0, len(nums) - 1

    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid

    return nums[left]`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2]
            if (step.type === 'go-right') return [5, 6, 7]
            if (step.type === 'go-left')  return [5, 8, 9]
            if (step.type === 'done')     return [11]
            return []
          },
        },
      },
    ],
  },
}
