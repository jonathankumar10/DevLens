export default {
  id: 'two-sum',
  title: 'Two Sum',
  difficulty: 'Easy',
  pattern: 'Hash Map',
  category: 'arrays-hashing',
  description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume exactly one solution exists, and you may not use the same element twice.',
  metaphor: 'We picture each number as a glass bottle filled to that level. Scanning left to right, we check whether the bottle we need to complete the pair is already on the shelf.',
  tags: ['array', 'hash-map'],
  problemUrl: 'https://leetcode.com/problems/two-sum/',
  problemLabel: 'LeetCode #1',

  solution: {
    approaches: [
      {
        id: 'hashmap',
        label: 'Hash Map',
        complexity: { time: 'O(n)', space: 'O(n)' },
        java: {
          code: `public int[] twoSum2(int[] nums, int target) {
    Map<Integer, Integer> dict = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int difference = target - nums[i];
        System.out.println("Difference " + difference);
        if (dict.containsKey(difference)) {
            return new int[] { dict.get(difference), i };
        } else {
            dict.put(nums[i], i);
        }
    }
    return new int[] {};
}`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2]
            if (step.type === 'check')    return [3, 4, 6]
            if (step.type === 'found')    return [7]
            if (step.type === 'store')    return [9]
            if (step.type === 'notfound') return [12]
            return []
          },
        },
        python: {
          code: `def twoSum(nums, target):
    seen = {}

    for i, num in enumerate(nums):
        complement = target - num

        if complement in seen:
            return [seen[complement], i]

        seen[num] = i

    return []`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2]
            if (step.type === 'check')    return [5, 7]
            if (step.type === 'found')    return [8]
            if (step.type === 'store')    return [10]
            if (step.type === 'notfound') return [12]
            return []
          },
        },
      },
      {
        id: 'brute',
        label: 'Brute Force',
        complexity: { time: 'O(n²)', space: 'O(1)' },
        java: {
          code: `public int[] twoSum(int[] nums, int target) {
    ArrayList<Integer> arr = new ArrayList<>();
    for (int i = 0; i <= nums.length; i++) {
        for (int j = i + 1; j <= nums.length - 1; j++) {
            if (nums[j] == target - nums[i]) {
                arr.add(j);
                arr.add(i);
            }
        }
    }
    return arr.stream().mapToInt(Integer::intValue).toArray();
}`,
          getHighlightLines(step) {
            if (step.type === 'check')    return [3, 4, 5]
            if (step.type === 'found')    return [5, 6, 7]
            if (step.type === 'notfound') return [11]
            return []
          },
        },
        python: {
          code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
          getHighlightLines(step) {
            if (step.type === 'check')    return [2, 3, 4]
            if (step.type === 'found')    return [4, 5]
            if (step.type === 'notfound') return [6]
            return []
          },
        },
      },
    ],
  },
}
