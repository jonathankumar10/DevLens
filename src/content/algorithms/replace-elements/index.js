export default {
  id: 'replace-elements',
  title: 'Replace Elements with Greatest Element on Right Side',
  difficulty: 'Easy',
  pattern: 'Array',
  category: 'arrays-hashing',
  description: 'Given an array arr, replace every element in that array with the greatest element among the elements to its right, and replace the last element with -1. Return the resulting array.',
  metaphor: 'Imagine walking a row of numbered podiums from right to left, carrying a trophy that always holds the highest value seen so far. Before moving left, you swap the current podium\'s number with whatever the trophy shows — then update the trophy if the podium beat it.',
  tags: ['array', 'reverse-scan'],
  problemUrl: 'https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/',
  problemLabel: 'LeetCode #1299',

  solution: {
    approaches: [
      {
        id: 'brute-force',
        label: 'Brute Force',
        complexity: { time: 'O(n²)', space: 'O(n)' },
        java: {
          code: `public int[] replaceElements(int[] nums) {
    int[] result = new int[nums.length];
    for (int i = 0; i < nums.length; i++) {
        int value = -1;
        for (int j = i + 1; j < nums.length; j++) {
            value = Math.max(nums[j], value);
        }
        result[i] = value;
    }
    return result;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')         return [2]
            if (step.type === 'outer-start')  return [3, 4]
            if (step.type === 'inner-scan')   return [5, 6]
            if (step.type === 'place')        return [8]
            if (step.type === 'done')         return [10]
            return []
          },
        },
        python: {
          code: `def replaceElements(arr):
    result = [0] * len(arr)
    for i in range(len(arr)):
        max_value = -1
        for j in range(i + 1, len(arr)):
            max_value = max(max_value, arr[j])
        result[i] = max_value
    return result`,
          getHighlightLines(step) {
            if (step.type === 'init')         return [2]
            if (step.type === 'outer-start')  return [3, 4]
            if (step.type === 'inner-scan')   return [5, 6]
            if (step.type === 'place')        return [7]
            if (step.type === 'done')         return [8]
            return []
          },
        },
      },
      {
        id: 'reverse-scan',
        label: 'Reverse Scan',
        complexity: { time: 'O(n)', space: 'O(n)' },
        java: {
          code: `public int[] replaceElements(int[] nums) {
    int[] result = new int[nums.length];
    int value = -1;
    for (int i = nums.length - 1; i >= 0; i--) {
        result[i] = value;
        value = Math.max(value, nums[i]);
    }
    return result;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')  return [2, 3]
            if (step.type === 'scan')  return [4, 5, 6]
            if (step.type === 'done')  return [8]
            return []
          },
        },
        python: {
          code: `def replaceElements(arr):
    result = [0] * len(arr)
    max_value = -1
    for i in range(len(arr) - 1, -1, -1):
        result[i] = max_value
        max_value = max(max_value, arr[i])
    return result`,
          getHighlightLines(step) {
            if (step.type === 'init')  return [2, 3]
            if (step.type === 'scan')  return [4, 5, 6]
            if (step.type === 'done')  return [7]
            return []
          },
        },
      },
    ],
  },
}
