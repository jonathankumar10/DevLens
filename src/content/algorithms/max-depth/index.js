export default {
  id: 'max-depth',
  title: 'Maximum Depth of Binary Tree',
  difficulty: 'Easy',
  pattern: 'Tree DFS',
  category: 'trees',
  path: '/algorithms/max-depth',
  description: 'Given the root of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.',
  metaphor: 'Every node asks its two children "how deep are you?" and waits. An empty child answers 0. Once both answers arrive, the node reports one more than the bigger answer back to its own parent. The answers bubble up from the leaves until the root has the final number.',
  tags: ['tree', 'dfs', 'recursion'],
  problemUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
  problemLabel: 'LeetCode #104',

  solution: {
    approaches: [
      {
        id: 'recursive-dfs',
        label: 'Recursive DFS',
        complexity: { time: 'O(n)', space: 'O(h)' },
        java: {
          code: `public int maxDepth(TreeNode root) {
    if (root == null) {
        return 0;
    }

    int left = maxDepth(root.left);
    int right = maxDepth(root.right);
    return 1 + Math.max(left, right);
}`,
          getHighlightLines(step) {
            if (step.type === 'empty')     return [2, 3]
            if (step.type === 'enter')     return [6]
            if (step.type === 'left-done') return [7]
            if (step.type === 'return')    return [8]
            if (step.type === 'done')      return [8]
            return []
          },
        },
        python: {
          code: `def maxDepth(self, root: Optional[TreeNode]) -> int:
    if not root:
        return 0

    left = self.maxDepth(root.left)
    right = self.maxDepth(root.right)
    return 1 + max(left, right)`,
          getHighlightLines(step) {
            if (step.type === 'empty')     return [2, 3]
            if (step.type === 'enter')     return [5]
            if (step.type === 'left-done') return [6]
            if (step.type === 'return')    return [7]
            if (step.type === 'done')      return [7]
            return []
          },
        },
      },
    ],
  },
}
