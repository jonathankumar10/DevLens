export default {
  id: 'tree-traversal',
  title: 'Tree Traversal',
  difficulty: 'Medium',
  pattern: 'DFS',
  category: 'trees',
  description: 'Given the root of a binary tree, return the values of its nodes in traversal order. Inorder visits left → node → right; preorder visits node → left → right; postorder visits left → right → node.',
  metaphor: 'We picture the tree as a living organism where each node glows as it is visited. Watching the light travel through the branches makes the difference between the three orders immediately obvious.',
  tags: ['tree', 'dfs', 'recursion'],
  problemUrl: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
  problemLabel: 'LeetCode #94',

  solution: {
    approaches: [
      {
        id: 'inorder',
        label: 'Inorder',
        complexity: { time: 'O(n)', space: 'O(h)' },
        java: {
          code: `void inorder(TreeNode node) {
    if (node == null) return;   // base case

    inorder(node.left);         // 1. recurse left

    visit(node);                // 2. process node ←

    inorder(node.right);        // 3. recurse right
}`,
          getHighlightLines(step) {
            if (!step.current) return [1, 2]
            return [6]
          },
        },
        python: {
          code: `def inorder(node):
    if node is None: return   # base case

    inorder(node.left)        # 1. recurse left

    visit(node)               # 2. process node ←

    inorder(node.right)       # 3. recurse right`,
          getHighlightLines(step) {
            if (!step.current) return [1, 2]
            return [6]
          },
        },
      },
      {
        id: 'preorder',
        label: 'Preorder',
        complexity: { time: 'O(n)', space: 'O(h)' },
        java: {
          code: `void preorder(TreeNode node) {
    if (node == null) return;   // base case

    visit(node);                // 1. process node ←

    preorder(node.left);        // 2. recurse left
    preorder(node.right);       // 3. recurse right
}`,
          getHighlightLines(step) {
            if (!step.current) return [1, 2]
            return [4]
          },
        },
        python: {
          code: `def preorder(node):
    if node is None: return   # base case

    visit(node)               # 1. process node ←

    preorder(node.left)       # 2. recurse left
    preorder(node.right)      # 3. recurse right`,
          getHighlightLines(step) {
            if (!step.current) return [1, 2]
            return [4]
          },
        },
      },
      {
        id: 'postorder',
        label: 'Postorder',
        complexity: { time: 'O(n)', space: 'O(h)' },
        java: {
          code: `void postorder(TreeNode node) {
    if (node == null) return;   // base case

    postorder(node.left);       // 1. recurse left
    postorder(node.right);      // 2. recurse right

    visit(node);                // 3. process node ←
}`,
          getHighlightLines(step) {
            if (!step.current) return [1, 2]
            return [7]
          },
        },
        python: {
          code: `def postorder(node):
    if node is None: return   # base case

    postorder(node.left)      # 1. recurse left
    postorder(node.right)     # 2. recurse right

    visit(node)               # 3. process node ←`,
          getHighlightLines(step) {
            if (!step.current) return [1, 2]
            return [7]
          },
        },
      },
    ],
  },
}
