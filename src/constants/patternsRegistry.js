import { ALGORITHMS } from './algorithmRegistry'
import { PALETTE } from './palette'

const PATTERN_DATA = [
  {
    id: 'arrays',
    title: 'Arrays',
    tagline: 'Sequential storage with O(1) index access',
    color: 'sky',
    description: `Arrays store elements in contiguous memory, each assigned a numbered index. Because any element's address is derivable directly from its index, reads and writes at a known position are instant — O(1). The trade-off: inserting or removing in the middle requires shifting every element after it, costing O(n).`,
    howItWorks: [
      'Elements sit side-by-side in memory; each is exactly one slot wide.',
      'Address of index i = base_address + i × element_size — one arithmetic step.',
      'Iteration is the core primitive: scan every index once for O(n) problems.',
      'Two-pointer and sliding-window patterns build directly on the array\'s indexability.',
    ],
    whenToUse: [
      'You need random access by position.',
      'The problem asks you to scan, compare, or transform each element.',
      'You need the foundation for a stack, queue, or hash map.',
    ],
    complexity: [
      { op: 'Access by index', time: 'O(1)' },
      { op: 'Search (linear scan)', time: 'O(n)' },
      { op: 'Insert / Delete (middle)', time: 'O(n)' },
      { op: 'Insert / Delete (end)', time: 'O(1) amortized' },
    ],
    algorithmIds: ['contains-duplicate', 'max-consecutive-ones', 'remove-element', 'replace-elements', 'concatenation-of-array', 'maximum-subarray'],
  },
  {
    id: 'hash-map',
    title: 'Hash Map',
    tagline: 'O(1) lookup by key using hashing',
    color: 'amber',
    description: `A hash map maps arbitrary keys to values in O(1) average time. A hash function converts the key into a bucket index. Because multiple keys can land in the same bucket (a collision), each bucket holds a short chain — but in practice these stay tiny, keeping average-case operations constant.`,
    howItWorks: [
      'hash(key) → bucket index in O(1).',
      'Each bucket stores (key, value) pairs to handle collisions (chaining).',
      'get / set / delete are all O(1) average; O(n) worst-case is rare.',
      'Core trade-off: spend O(n) extra space to gain O(1) lookup time.',
    ],
    whenToUse: [
      '"Have I seen this before?" — track visited or counted elements.',
      '"What\'s the complement of x?" — two-sum style pair lookups.',
      'Counting frequencies or grouping elements by an arbitrary key.',
    ],
    complexity: [
      { op: 'Get / Set / Delete', time: 'O(1) avg' },
      { op: 'Worst case (all collide)', time: 'O(n)' },
      { op: 'Space', time: 'O(n)' },
    ],
    algorithmIds: ['two-sum', 'valid-anagram'],
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    tagline: 'Two indices closing in from opposite ends — O(n), O(1) space',
    color: 'cyan',
    description: `Two pointers walk toward each other (or in the same direction at different speeds) across an indexable structure, eliminating the need for nested loops. Because each pointer only ever moves forward, the whole pass is O(n) — and since no extra structure is needed to track state, it runs in O(1) space.`,
    howItWorks: [
      'Start one pointer at the beginning (left) and one at the end (right) of the structure.',
      'Each step, decide which pointer(s) to move based on a comparison — no backtracking, no revisiting.',
      'The pointers meet or cross when the whole range has been covered exactly once.',
      'A variant (fast/slow) moves both pointers from the same end at different speeds — used for cycle detection and finding midpoints.',
    ],
    whenToUse: [
      'The input is a string or sorted array and you\'re comparing pairs from both ends.',
      'Brute force is O(n²) with nested loops that could instead be replaced by two indices moving inward.',
      'You need to check a property "from the outside in" — palindromes, container/area problems, sorted-pair sums.',
    ],
    complexity: [
      { op: 'Pass over n elements', time: 'O(n)' },
      { op: 'Space', time: 'O(1)' },
    ],
    algorithmIds: ['valid-palindrome', 'two-sum-ii', 'container-with-most-water', 'remove-duplicates', 'move-zeroes'],
  },
  {
    id: 'stack',
    title: 'Stack',
    tagline: 'Last-in first-out — undo, matching, depth-first',
    color: 'violet',
    description: `A stack follows Last-In First-Out (LIFO) order. Push adds to the top; pop removes from the top. This "memory of the most recent thing" is exactly what you need whenever you must undo or match the most recently seen element before older ones — bracket matching, call stacks, and iterative DFS all rely on it.`,
    howItWorks: [
      'push(x) → place x on top. O(1).',
      'pop() → remove and return the top element. O(1).',
      'peek() → read the top without removing. O(1).',
      'The CPU call stack is itself a stack — recursion is an implicit one.',
    ],
    whenToUse: [
      'Matching or nesting: brackets, HTML tags, undo history.',
      'Depth-first traversal implemented iteratively instead of recursively.',
      'You need the "most recently seen" item at any moment.',
    ],
    complexity: [
      { op: 'Push / Pop / Peek', time: 'O(1)' },
      { op: 'Access (arbitrary element)', time: 'O(n)' },
      { op: 'Space', time: 'O(n)' },
    ],
    algorithmIds: ['valid-parentheses', 'min-stack', 'baseball-game'],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    tagline: 'Halve the search space each step — O(log n)',
    color: 'emerald',
    description: `Binary search works on any sorted, indexable sequence. By comparing the middle element to the target, you eliminate half the remaining candidates in one step. This yields O(log n) time — searching a billion elements takes at most 30 comparisons.`,
    howItWorks: [
      'Set left = 0, right = n − 1.',
      'Compute mid = Math.floor((left + right) / 2).',
      'If nums[mid] === target → found, return mid.',
      'If nums[mid] < target → left = mid + 1 (search right half).',
      'If nums[mid] > target → right = mid − 1 (search left half).',
      'Repeat until left > right → not found, return −1.',
    ],
    whenToUse: [
      'The input is sorted (or has a monotone true/false predicate).',
      'Searching for a value, a boundary, or the first/last satisfying index.',
      'Brute-force is O(n) but the problem hints at O(log n).',
    ],
    complexity: [
      { op: 'Search', time: 'O(log n)' },
      { op: 'Space (iterative)', time: 'O(1)' },
      { op: 'Space (recursive)', time: 'O(log n)' },
    ],
    algorithmIds: ['binary-search', 'search-matrix', 'first-bad-version', 'next-greatest-letter', 'find-min-rotated', 'search-rotated', 'koko-eating-bananas'],
  },
  {
    id: 'linked-list',
    title: 'Linked List',
    tagline: 'Dynamic node chain — O(1) insert/delete at known position',
    color: 'rose',
    description: `A linked list is a chain of nodes where each node holds a value and a pointer to the next node. Unlike arrays, nodes need not be contiguous in memory, so inserting or deleting at a known position is O(1) — just rewire two pointers. Finding that position still requires O(n) traversal.`,
    howItWorks: [
      'Each node: { val, next }. The list is a reference to the head node.',
      'Traversal: follow .next pointers until null. O(n).',
      'Insert / delete at known position: update one .next pointer. O(1).',
      'Fast/slow pointer trick detects cycles and finds midpoints in a single O(n) pass.',
    ],
    whenToUse: [
      'You need O(1) insert/delete without shifting elements.',
      'The problem involves reversing, merging, or cycle detection.',
      'Implementing a stack, queue, or LRU cache.',
    ],
    complexity: [
      { op: 'Access / Search', time: 'O(n)' },
      { op: 'Insert / Delete (at known node)', time: 'O(1)' },
      { op: 'Insert / Delete (by value)', time: 'O(n)' },
    ],
    algorithmIds: ['reverse-linked-list', 'merge-sorted-lists', 'linked-list-cycle', 'remove-nth-node', 'reorder-list', 'design-linked-list'],
  },
  {
    id: 'trees',
    title: 'Trees',
    tagline: 'Hierarchical structure — DFS and BFS traversal',
    color: 'teal',
    description: `A binary tree is a linked structure where each node has at most two children. Trees naturally encode hierarchy and sorted data. Almost every tree problem reduces to a traversal: depth-first (DFS) goes deep before wide, visiting a whole subtree before the next sibling; breadth-first (BFS) visits nodes level by level.`,
    howItWorks: [
      'Inorder (L → root → R): visits BST nodes in ascending sorted order.',
      'Preorder (root → L → R): useful for copying or serializing.',
      'Postorder (L → R → root): useful for deleting or evaluating subtrees.',
      'Level-order BFS via a queue: ideal for shortest path and per-level problems.',
    ],
    whenToUse: [
      'Data is hierarchical or nested (file systems, parse trees).',
      'You need to process subtrees before the parent node.',
      'Level-by-level reasoning — use BFS.',
    ],
    complexity: [
      { op: 'Access / Search (balanced)', time: 'O(log n)' },
      { op: 'Access / Search (skewed)', time: 'O(n)' },
      { op: 'DFS / BFS traversal', time: 'O(n)' },
    ],
    algorithmIds: ['tree-traversal', 'max-depth', 'invert-tree'],
  },
  {
    id: 'graphs-bfs',
    title: 'Graphs & BFS',
    tagline: 'General connectivity — shortest path in unweighted graphs',
    color: 'blue',
    description: `A graph is any collection of nodes connected by edges. Unlike trees, graphs may have cycles, disconnected components, and edges in any direction. Breadth-First Search explores level by level from a start node — visiting all immediate neighbors before their neighbors — guaranteeing shortest paths in unweighted graphs.`,
    howItWorks: [
      'Enqueue the start node; mark it visited.',
      'While the queue is not empty: dequeue a node, process it.',
      'For each unvisited neighbor: mark visited, enqueue.',
      'The BFS "level" at which a node is first reached equals its shortest distance from the source.',
    ],
    whenToUse: [
      'Shortest path in an unweighted graph or grid.',
      'Level-by-level exploration: word ladder, multi-source BFS.',
      'Connectivity: is there any path between two nodes?',
    ],
    complexity: [
      { op: 'Time (V = nodes, E = edges)', time: 'O(V + E)' },
      { op: 'Space (visited + queue)', time: 'O(V)' },
    ],
    algorithmIds: ['bfs', 'clone-graph'],
  },
]

export const PATTERNS = PATTERN_DATA.map((p) => ({
  ...p,
  algorithms: ALGORITHMS.filter((a) => p.algorithmIds.includes(a.id)),
}))

export const PATTERN_COLORS = PALETTE
