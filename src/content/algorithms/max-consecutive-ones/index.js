export default {
  id: 'max-consecutive-ones',
  title: 'Max Consecutive Ones',
  difficulty: 'Easy',
  pattern: 'Sliding Window',
  category: 'arrays-hashing',
  description: 'Given a binary array nums, return the maximum number of consecutive 1s in the array.',
  metaphor: 'We picture the array as a row of floor tiles — lit (1) or dark (0). Walking left to right we count how many lit tiles we cross in a single unbroken run; the moment we step on a dark tile the run resets to zero, but we keep a memory of the longest run seen so far.',
  tags: ['array', 'sliding-window'],
  problemUrl: 'https://leetcode.com/problems/max-consecutive-ones/',
  problemLabel: 'LeetCode #485',

  solution: {
    approaches: [
      {
        id: 'linear',
        label: 'Linear Scan',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int findMaxConsecutiveOnes(int[] nums) {
    int count = 0;
    int maxCount = 0;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == 1) {
            count++;
        }
        if (nums[i] == 0) {
            count = 0;
        }
        maxCount = Math.max(maxCount, count);
    }
    return maxCount;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2, 3]
            if (step.type === 'increment') return [5, 6, 11]
            if (step.type === 'reset')     return [8, 9, 11]
            if (step.type === 'done')      return [13]
            return []
          },
        },
        python: {
          code: `def findMaxConsecutiveOnes(nums):
    count = 0
    max_count = 0

    for num in nums:
        if num == 1:
            count += 1
        else:
            count = 0
        max_count = max(max_count, count)

    return max_count`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2, 3]
            if (step.type === 'increment') return [6, 7, 10]
            if (step.type === 'reset')     return [8, 9, 10]
            if (step.type === 'done')      return [12]
            return []
          },
        },
      },
    ],
  },
}
