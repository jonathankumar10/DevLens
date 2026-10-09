import twoSum                from '../content/algorithms/two-sum/index.js'
import bfs                   from '../content/algorithms/bfs/index.js'
import treeTraversal         from '../content/algorithms/tree-traversal/index.js'
import containsDuplicate     from '../content/algorithms/contains-duplicate/index.js'
import maxConsecutiveOnes    from '../content/algorithms/max-consecutive-ones/index.js'
import removeElement         from '../content/algorithms/remove-element/index.js'
import replaceElements       from '../content/algorithms/replace-elements/index.js'
import concatenationOfArray  from '../content/algorithms/concatenation-of-array/index.js'
import validPalindrome       from '../content/algorithms/valid-palindrome/index.js'
import baseballGame          from '../content/algorithms/baseball-game/index.js'
import validParentheses      from '../content/algorithms/valid-parentheses/index.js'
import minStack              from '../content/algorithms/min-stack/index.js'
import searchMatrix          from '../content/algorithms/search-matrix/index.js'
import binarySearch          from '../content/algorithms/binary-search/index.js'
import guessNumber           from '../content/algorithms/guess-number/index.js'
import reverseLinkedList     from '../content/algorithms/reverse-linked-list/index.js'
import mergeSortedLists      from '../content/algorithms/merge-sorted-lists/index.js'
import maximumSubarray       from '../content/algorithms/maximum-subarray/index.js'
import validAnagram          from '../content/algorithms/valid-anagram/index.js'
import removeDuplicates      from '../content/algorithms/remove-duplicates/index.js'
import moveZeroes            from '../content/algorithms/move-zeroes/index.js'
import twoSumII              from '../content/algorithms/two-sum-ii/index.js'
import containerWithMostWater from '../content/algorithms/container-with-most-water/index.js'
import nextGreatestLetter    from '../content/algorithms/next-greatest-letter/index.js'
import firstBadVersion       from '../content/algorithms/first-bad-version/index.js'
import findMinRotated        from '../content/algorithms/find-min-rotated/index.js'
import searchRotated         from '../content/algorithms/search-rotated/index.js'
import kokoEatingBananas     from '../content/algorithms/koko-eating-bananas/index.js'
import linkedListCycle       from '../content/algorithms/linked-list-cycle/index.js'
import removeNthNode         from '../content/algorithms/remove-nth-node/index.js'
import reorderList           from '../content/algorithms/reorder-list/index.js'
import designLinkedList      from '../content/algorithms/design-linked-list/index.js'
import maxDepth              from '../content/algorithms/max-depth/index.js'
import invertTree            from '../content/algorithms/invert-tree/index.js'
import cloneGraph            from '../content/algorithms/clone-graph/index.js'
import climbingStairs        from '../content/algorithms/climbing-stairs/index.js'
import houseRobber           from '../content/algorithms/house-robber/index.js'

// Ordered list — add new algorithms here, one import + one array entry.
export const ALGORITHMS = [
  twoSum,
  bfs,
  treeTraversal,
  containsDuplicate,
  maxConsecutiveOnes,
  removeElement,
  replaceElements,
  concatenationOfArray,
  validPalindrome,
  baseballGame,
  validParentheses,
  minStack,
  searchMatrix,
  binarySearch,
  guessNumber,
  reverseLinkedList,
  mergeSortedLists,
  maximumSubarray,
  validAnagram,
  removeDuplicates,
  moveZeroes,
  twoSumII,
  containerWithMostWater,
  nextGreatestLetter,
  firstBadVersion,
  findMinRotated,
  searchRotated,
  kokoEatingBananas,
  linkedListCycle,
  removeNthNode,
  reorderList,
  designLinkedList,
  maxDepth,
  invertTree,
  cloneGraph,
  climbingStairs,
  houseRobber,
]

export const DIFFICULTY_COLOR = {
  Easy:   'text-emerald-400 bg-emerald-400/10',
  Medium: 'text-amber-400  bg-amber-400/10',
  Hard:   'text-rose-400   bg-rose-400/10',
}

// category slug → display label
export const CATEGORY_LABELS = {
  'arrays-hashing':      'Arrays & Hashing',
  'two-pointers':        'Two Pointers',
  'stack':               'Stack',
  'binary-search':       'Binary Search',
  'sliding-window':      'Sliding Window',
  'linked-list':         'Linked List',
  'trees':               'Trees',
  'tries':               'Tries',
  'backtracking':        'Backtracking',
  'heap-priority-queue': 'Heap / Priority Queue',
  'graphs':              'Graphs',
  'advanced-graphs':     'Advanced Graphs',
  '1d-dp':               '1-D DP',
  '2d-dp':               '2-D DP',
  'greedy':              'Greedy',
  'intervals':           'Intervals',
  'bit-manipulation':    'Bit Manipulation',
  'math-geometry':       'Math & Geometry',
}
