export default {
  id: 'contains-duplicate',
  title: 'Contains Duplicate',
  difficulty: 'Easy',
  pattern: 'Hash Set',
  category: 'arrays-hashing',
  description: 'Given an integer array nums, return true if any value appears at least twice, and false if every element is distinct.',
  metaphor: 'We picture each number as a pile of gold coins — the pile height equals the value. As we scan left to right we drop each height into a seen bin; the moment we reach a pile whose height is already in the bin, the alarm sounds.',
  tags: ['array', 'hash-set', 'sorting'],
  problemUrl: 'https://leetcode.com/problems/contains-duplicate/',
  problemLabel: 'LeetCode #217',

  solution: {
    approaches: [
      {
        id: 'hashset',
        label: 'Hash Set',
        complexity: { time: 'O(n)', space: 'O(n)' },
        java: {
          code: `public boolean containsDuplicate2(int[] nums) {
    final Set<Integer> set = new HashSet<>();
    for (int i = 0; i < nums.length; i++) {
        if (set.contains(nums[i])) {
            return true;
        }
        set.add(nums[i]);
    }
    return false;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2]
            if (step.type === 'check')     return [3, 4]
            if (step.type === 'duplicate') return [5]
            if (step.type === 'add')       return [7]
            if (step.type === 'done')      return [9]
            return []
          },
        },
        python: {
          code: `def hasDuplicate2(self, nums: List[int]) -> bool:
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2]
            if (step.type === 'check')     return [3, 4]
            if (step.type === 'duplicate') return [5]
            if (step.type === 'add')       return [6]
            if (step.type === 'done')      return [7]
            return []
          },
        },
      },
      {
        id: 'sorting',
        label: 'Sort',
        complexity: { time: 'O(n log n)', space: 'O(1)' },
        java: {
          code: `public boolean containsDuplicate3(int[] nums) {
    Arrays.sort(nums);
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] == nums[i - 1]) {
            return true;
        }
    }
    return false;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2]
            if (step.type === 'check')     return [3, 4]
            if (step.type === 'duplicate') return [5]
            if (step.type === 'done')      return [8]
            return []
          },
        },
        python: {
          code: `def hasDuplicate(self, nums: List[int]) -> bool:
    nums.sort()
    for i in range(1, len(nums)):
        if(nums[i] == nums[i-1]):
            return True
    return False`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2]
            if (step.type === 'check')     return [3, 4]
            if (step.type === 'duplicate') return [5]
            if (step.type === 'done')      return [6]
            return []
          },
        },
      },
      {
        id: 'brute',
        label: 'Brute Force',
        complexity: { time: 'O(n²)', space: 'O(1)' },
        java: {
          code: `public boolean containsDuplicate(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) {
                return true;
            }
        }
    }
    return false;
}`,
          getHighlightLines(step) {
            if (step.type === 'check')     return [2, 3, 4]
            if (step.type === 'duplicate') return [5]
            if (step.type === 'done')      return [9]
            return []
          },
        },
        python: {
          code: `def containsDuplicate(nums):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False`,
          getHighlightLines(step) {
            if (step.type === 'check')     return [2, 3, 4]
            if (step.type === 'duplicate') return [5]
            if (step.type === 'done')      return [6]
            return []
          },
        },
      },
    ],
  },
}
