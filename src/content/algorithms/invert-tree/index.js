export default {
  id: 'invert-tree',
  title: 'Invert Binary Tree',
  difficulty: 'Easy',
  pattern: 'Tree DFS',
  category: 'trees',
  path: '/algorithms/invert-tree',
  description: 'Given the root of a binary tree, invert the tree — mirror it left-to-right — and return its root.',
  metaphor: 'Hold the tree up to a mirror. Recursively, each node first lets both of its subtrees mirror themselves, then simply swaps its own left and right pointers. When the swaps bubble all the way up to the root, the whole tree is flipped.',
  tags: ['tree', 'dfs', 'recursion'],
  problemUrl: 'https://leetcode.com/problems/invert-binary-tree/',
  problemLabel: 'LeetCode #226',

  solution: {
    approaches: [
      {
        id: 'recursive-dfs',
        label: 'Recursive DFS',
        complexity: { time: 'O(n)', space: 'O(h)' },
        java: {
          code: `public TreeNode invertTree(TreeNode root) {
    if (root == null) {
        return null;
    }

    TreeNode left = invertTree(root.left);
    TreeNode right = invertTree(root.right);

    root.left = right;
    root.right = left;
    return root;
}`,
          getHighlightLines(step) {
            if (step.type === 'empty') return [2, 3]
            if (step.type === 'enter') return [6, 7]
            if (step.type === 'swap')  return [9, 10, 11]
            if (step.type === 'done')  return [11]
            return []
          },
        },
        python: {
          code: `def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
    if not root:
        return None

    left = self.invertTree(root.left)
    right = self.invertTree(root.right)

    root.left, root.right = right, left
    return root`,
          getHighlightLines(step) {
            if (step.type === 'empty') return [2, 3]
            if (step.type === 'enter') return [5, 6]
            if (step.type === 'swap')  return [8, 9]
            if (step.type === 'done')  return [9]
            return []
          },
        },
      },
    ],
  },
}
