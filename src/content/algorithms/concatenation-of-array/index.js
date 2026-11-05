export default {
  id: 'concatenation-of-array',
  title: 'Concatenation of Array',
  difficulty: 'Easy',
  pattern: 'Array',
  category: 'arrays-hashing',
  description: 'Given an integer array nums of length n, return an array ans of length 2n where ans[i] == nums[i] and ans[i + n] == nums[i] for 0 <= i < n. Essentially, ans is the concatenation of two copies of nums.',
  metaphor: 'Picture a rubber stamp carrying one value at a time — at each stop it presses the same value down into two spots at once: the matching slot in the left half and the matching slot in the right half.',
  tags: ['array'],
  problemUrl: 'https://leetcode.com/problems/concatenation-of-array/',
  problemLabel: 'LeetCode #1929',

  solution: {
    approaches: [
      {
        id: 'linear',
        label: 'Linear Scan',
        complexity: { time: 'O(n)', space: 'O(n)' },
        java: {
          code: `public int[] getConcatenation(int[] nums) {
    int[] ans = new int[nums.length * 2];
    for (int i = 0; i < nums.length; i++) {
        ans[i] = nums[i];
        ans[nums.length + i] = nums[i];
    }
    return ans;
}`,
          getHighlightLines(step) {
            if (step.type === 'init') return [2]
            if (step.type === 'fill') return [3, 4, 5]
            if (step.type === 'done') return [7]
            return []
          },
        },
        python: {
          code: `def getConcatenation(self, nums: List[int]) -> List[int]:
    result = [0] * (2 * len(nums))
    for i in range(len(nums)):
        result[i] = nums[i]
        result[len(nums) + i] = nums[i]

    return result`,
          getHighlightLines(step) {
            if (step.type === 'init') return [2]
            if (step.type === 'fill') return [3, 4, 5]
            if (step.type === 'done') return [7]
            return []
          },
        },
      },
    ],
  },
}
