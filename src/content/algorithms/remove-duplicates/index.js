export default {
  id: 'remove-duplicates',
  title: 'Remove Duplicates from Sorted Array',
  difficulty: 'Easy',
  pattern: 'Two Pointers',
  category: 'two-pointers',
  path: '/algorithms/remove-duplicates',
  description: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place so each unique element appears only once, keeping the relative order. Return k, the number of unique elements; the first k slots of nums must hold them.',
  metaphor: 'A reader (i) scans ahead while a writer (k) guards the end of the clean prefix. Because the array is sorted, a duplicate always sits right next to its twin — so the reader only has to compare against the last value the writer kept. New value? The writer copies it and steps forward.',
  tags: ['two-pointers', 'array', 'in-place'],
  problemUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
  problemLabel: 'LeetCode #26',

  solution: {
    approaches: [
      {
        id: 'read-write',
        label: 'Read / Write Pointers',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int removeDuplicates(int[] nums) {
    if (nums.length == 0) {
        return 0;
    }

    int k = 1;
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] != nums[k - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }

    return k;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')  return [6]
            if (step.type === 'skip')  return [7, 8]
            if (step.type === 'write') return [8, 9, 10]
            if (step.type === 'done')  return [14]
            return []
          },
        },
        python: {
          code: `def removeDuplicates(self, nums: List[int]) -> int:
    if not nums:
        return 0

    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[k - 1]:
            nums[k] = nums[i]
            k += 1

    return k`,
          getHighlightLines(step) {
            if (step.type === 'init')  return [5]
            if (step.type === 'skip')  return [6, 7]
            if (step.type === 'write') return [7, 8, 9]
            if (step.type === 'done')  return [11]
            return []
          },
        },
      },
    ],
  },
}
