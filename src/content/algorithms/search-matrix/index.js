export default {
  id: 'search-matrix',
  title: 'Search a 2D Matrix',
  difficulty: 'Medium',
  pattern: 'Binary Search',
  category: 'binary-search',
  description: 'Given an m×n matrix where each row is sorted and the first integer of each row is greater than the last of the previous row, determine if target exists in the matrix. Must run in O(log(m×n)).',
  metaphor: 'Imagine the matrix is a ribbon of paper folded into rows. Unfolded, it\'s one long sorted strip. Binary search places a finger at the midpoint of the strip, then maps that position back to the folded grid to read the value — halving the remaining ribbon each time.',
  tags: ['binary-search', '2d-array'],
  problemUrl: 'https://leetcode.com/problems/search-a-2d-matrix/',
  problemLabel: 'LeetCode #74',

  solution: {
    approaches: [
      {
        id: 'binary-search',
        label: 'Binary Search',
        complexity: { time: 'O(log(m×n))', space: 'O(1)' },
        python: {
          code: `def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
    rows = len(matrix)
    cols = len(matrix[0])

    left = 0
    right = (rows * cols) - 1

    while left <= right:
        midPoint = left + (right - left) // 2
        midRow = midPoint // cols
        midCol = midPoint % cols

        if matrix[midRow][midCol] == target:
            return True
        elif matrix[midRow][midCol] < target:
            left = midPoint + 1
        else:
            right = midPoint - 1

    return False`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2, 3, 5, 6]
            if (step.type === 'inspect')   return [8, 9, 10]
            if (step.type === 'found')     return [12, 13]
            if (step.type === 'go-right')  return [14, 15]
            if (step.type === 'go-left')   return [16, 17]
            if (step.type === 'not-found') return [19]
            return []
          },
        },
        java: {
          code: `public boolean searchMatrix(int[][] matrix, int target) {
    int rows = matrix.length;
    int cols = matrix[0].length;

    int left = 0;
    int right = (rows * cols) - 1;

    while (left <= right) {
        int midPoint = (left + (right - left) / 2);
        int midRow = midPoint / cols;
        int midCol = midPoint % cols;

        if (matrix[midRow][midCol] == target) {
            return true;
        } else {
            if (matrix[midRow][midCol] < target) {
                left = midPoint + 1;
            } else {
                right = midPoint - 1;
            }
        }
    }

    return false;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')      return [2, 3, 5, 6]
            if (step.type === 'inspect')   return [9, 10, 11]
            if (step.type === 'found')     return [13, 14]
            if (step.type === 'go-right')  return [16, 17]
            if (step.type === 'go-left')   return [18, 19]
            if (step.type === 'not-found') return [23]
            return []
          },
        },
      },
    ],
  },
}
