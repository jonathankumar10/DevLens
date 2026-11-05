export default {
  id: 'binary-search',
  title: 'Binary Search',
  difficulty: 'Easy',
  pattern: 'Binary Search',
  category: 'binary-search',
  description: 'Given a sorted array of integers and a target, return the index of the target using binary search. Return -1 if not found. Must run in O(log n).',
  metaphor: 'Picture a row of sealed lockers numbered in order. Two walls (L and R) mark the active range. Each round you crack open the middle locker — if it holds the target, you\'re done. If the number is too small, the left wall leaps past it. Too large, the right wall jumps back. The walls squeeze inward until they meet the answer or collide.',
  tags: ['binary-search', 'array'],
  problemUrl: 'https://leetcode.com/problems/binary-search/',
  problemLabel: 'LeetCode #704',

  solution: {
    approaches: [
      {
        id: 'binary-search',
        label: 'Binary Search',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        python: {
          code: `def search(self, nums: List[int], target: int) -> int:
    left = 0
    right = len(nums) - 1

    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2, 3]
            if (step.type === 'inspect')   return [5, 6]
            if (step.type === 'found')     return [7, 8]
            if (step.type === 'go-right')  return [9, 10]
            if (step.type === 'go-left')   return [11, 12]
            if (step.type === 'not-found') return [14]
            return []
          },
        },
        java: {
          code: `public int search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            return mid;
        } else {
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    return -1;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2, 3]
            if (step.type === 'inspect')   return [5, 6]
            if (step.type === 'found')     return [8, 9]
            if (step.type === 'go-right')  return [11, 12]
            if (step.type === 'go-left')   return [13, 14]
            if (step.type === 'not-found') return [19]
            return []
          },
        },
      },
    ],
  },
}
