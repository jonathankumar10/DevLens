export default {
  id: 'house-robber',
  title: 'House Robber',
  difficulty: 'Medium',
  pattern: '1-D Dynamic Programming',
  category: '1d-dp',
  path: '/algorithms/house-robber',
  description: 'Houses along a street each hold some money (nums[i]). Adjacent houses have connected alarms, so you can\'t rob two neighbours on the same night. Return the maximum amount you can rob.',
  metaphor: 'Walk down the street keeping a running ledger: dp[i] is the best haul using only the first i+1 houses. At each house there are exactly two choices — skip it and keep dp[i−1], or rob it and add its cash to dp[i−2] (the best haul that left its neighbour alone). Take the bigger one.',
  tags: ['dynamic-programming', 'array'],
  problemUrl: 'https://leetcode.com/problems/house-robber/',
  problemLabel: 'LeetCode #198',

  solution: {
    approaches: [
      {
        id: 'dp-array',
        label: 'Bottom-Up DP',
        complexity: { time: 'O(n)', space: 'O(n)' },
        java: {
          code: `public int rob(int[] nums) {
    int[] dp = new int[nums.length];
    dp[0] = nums[0];
    if (nums.length == 1) {
        return dp[0];
    }

    dp[1] = Math.max(nums[0], nums[1]);
    for (int i = 2; i < nums.length; i++) {
        dp[i] = Math.max(dp[i - 1], nums[i] + dp[i - 2]);
    }

    return dp[nums.length - 1];
}`,
          getHighlightLines(step) {
            if (step.type === 'base0')  return [2, 3]
            if (step.type === 'single') return [4, 5]
            if (step.type === 'base1')  return [8]
            if (step.type === 'rob')    return [9, 10]
            if (step.type === 'skip')   return [9, 10]
            if (step.type === 'done')   return [13]
            return []
          },
        },
        python: {
          code: `def rob(self, nums: List[int]) -> int:
    dp = [0] * len(nums)
    dp[0] = nums[0]
    if len(nums) == 1:
        return dp[0]

    dp[1] = max(nums[0], nums[1])
    for i in range(2, len(nums)):
        dp[i] = max(dp[i - 1], nums[i] + dp[i - 2])

    return dp[-1]`,
          getHighlightLines(step) {
            if (step.type === 'base0')  return [2, 3]
            if (step.type === 'single') return [4, 5]
            if (step.type === 'base1')  return [7]
            if (step.type === 'rob')    return [8, 9]
            if (step.type === 'skip')   return [8, 9]
            if (step.type === 'done')   return [11]
            return []
          },
        },
      },
      {
        id: 'two-variables',
        label: 'O(1) Space',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int rob(int[] nums) {
    int prev2 = 0;
    int prev1 = 0;
    for (int num : nums) {
        int curr = Math.max(prev1, num + prev2);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
          getHighlightLines(step) {
            if (step.type === 'base0')                      return [2, 3]
            if (['base1', 'rob', 'skip'].includes(step.type)) return [4, 5, 6, 7]
            if (['done', 'single'].includes(step.type))     return [9]
            return []
          },
        },
        python: {
          code: `def rob(self, nums: List[int]) -> int:
    prev2, prev1 = 0, 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, num + prev2)
    return prev1`,
          getHighlightLines(step) {
            if (step.type === 'base0')                      return [2]
            if (['base1', 'rob', 'skip'].includes(step.type)) return [3, 4]
            if (['done', 'single'].includes(step.type))     return [5]
            return []
          },
        },
      },
    ],
  },
}
