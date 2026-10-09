export default {
  id: 'maximum-subarray',
  title: 'Maximum Subarray',
  difficulty: 'Medium',
  pattern: "Kadane's Algorithm",
  category: 'arrays-hashing',
  path: '/algorithms/maximum-subarray',
  description: 'Given an integer array nums, find the contiguous subarray with the largest sum, and return its sum.',
  metaphor: 'A hiker carries a running total of the trail. Every step adds that step\'s value. The moment the running total drops below zero, it can only drag future sums down — so the hiker drops the baggage and starts a fresh window at the next step. The best total ever seen is the answer.',
  tags: ['array', 'dynamic-programming', 'kadane'],
  problemUrl: 'https://leetcode.com/problems/maximum-subarray/',
  problemLabel: 'LeetCode #53',

  solution: {
    approaches: [
      {
        id: 'kadane',
        label: "Kadane's",
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int maxSubArray(int[] nums) {
    int maxSum = Integer.MIN_VALUE;
    int currSum = 0;

    for (int num : nums) {
        if (currSum < 0) {
            currSum = 0;
        }
        currSum += num;
        maxSum = Math.max(currSum, maxSum);
    }

    return maxSum;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')    return [2, 3]
            if (step.type === 'reset')   return [6, 7]
            if (step.type === 'extend')  return [9, 10]
            if (step.type === 'new-max') return [9, 10]
            if (step.type === 'done')    return [13]
            return []
          },
        },
        python: {
          code: `def maxSubArray(self, nums: List[int]) -> int:
    max_sum = float('-inf')
    curr_sum = 0

    for num in nums:
        if curr_sum < 0:
            curr_sum = 0
        curr_sum += num
        max_sum = max(curr_sum, max_sum)

    return max_sum`,
          getHighlightLines(step) {
            if (step.type === 'init')    return [2, 3]
            if (step.type === 'reset')   return [6, 7]
            if (step.type === 'extend')  return [8, 9]
            if (step.type === 'new-max') return [8, 9]
            if (step.type === 'done')    return [11]
            return []
          },
        },
      },
    ],
  },
}
