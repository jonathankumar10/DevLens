export default {
  id: 'two-sum-ii',
  title: 'Two Sum II – Input Array Is Sorted',
  difficulty: 'Medium',
  pattern: 'Two Pointers',
  category: 'two-pointers',
  path: '/algorithms/two-sum-ii',
  description: 'Given a 1-indexed array of integers sorted in non-decreasing order, find two numbers that add up to target. Return their indices [index1, index2] (1-indexed, index1 < index2) using only constant extra space.',
  metaphor: 'Because the array is sorted, the two ends act like a volume knob. Sum too big? Turn it down by moving the right pointer to a smaller number. Too small? Turn it up by moving the left pointer to a bigger number. Every move rules out a whole row of pairs, so one pass is enough — no hash map needed.',
  tags: ['two-pointers', 'array', 'sorted'],
  problemUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
  problemLabel: 'LeetCode #167',

  solution: {
    approaches: [
      {
        id: 'two-pointers',
        label: 'Two Pointers',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int[] twoSum(int[] numbers, int target) {
    int left = 0;
    int right = numbers.length - 1;

    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum > target) {
            right--;
        } else if (sum < target) {
            left++;
        } else {
            return new int[] { left + 1, right + 1 };
        }
    }

    return new int[] { -1, -1 };
}`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2, 3]
            if (step.type === 'too-big')   return [6, 7, 8]
            if (step.type === 'too-small') return [6, 9, 10]
            if (step.type === 'found')     return [11, 12]
            if (step.type === 'not-found') return [16]
            return []
          },
        },
        python: {
          code: `def twoSum(self, numbers: List[int], target: int) -> List[int]:
    left, right = 0, len(numbers) - 1

    while left < right:
        total = numbers[left] + numbers[right]
        if total > target:
            right -= 1
        elif total < target:
            left += 1
        else:
            return [left + 1, right + 1]

    return [-1, -1]`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2]
            if (step.type === 'too-big')   return [5, 6, 7]
            if (step.type === 'too-small') return [5, 8, 9]
            if (step.type === 'found')     return [10, 11]
            if (step.type === 'not-found') return [13]
            return []
          },
        },
      },
    ],
  },
}
