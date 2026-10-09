export default {
  id: 'remove-nth-node',
  title: 'Remove Nth Node From End of List',
  difficulty: 'Medium',
  pattern: 'Fast & Slow Pointers',
  category: 'linked-list',
  path: '/algorithms/remove-nth-node',
  description: 'Given the head of a linked list, remove the nth node from the end of the list and return its head.',
  metaphor: 'Two walkers hold a rope exactly n nodes long. The front walker gets a head start of n steps, then both walk together. When the front walker reaches the last node, the back walker is standing right before the node to delete — so it just skips over it. A dummy node in front means even removing the head needs no special case.',
  tags: ['linked-list', 'two-pointers'],
  problemUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
  problemLabel: 'LeetCode #19',

  solution: {
    approaches: [
      {
        id: 'gap-pointers',
        label: 'Gap of n',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head);
    ListNode slow = dummy;
    ListNode fast = dummy;

    for (int i = 0; i < n; i++) {
        fast = fast.next;
    }

    while (fast.next != null) {
        slow = slow.next;
        fast = fast.next;
    }

    slow.next = slow.next.next;
    return dummy.next;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')         return [2, 3, 4]
            if (step.type === 'advance-fast') return [6, 7]
            if (step.type === 'move-both')    return [10, 11, 12]
            if (step.type === 'remove')       return [15]
            if (step.type === 'done')         return [16]
            return []
          },
        },
        python: {
          code: `def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
    dummy = ListNode(0, head)
    slow, fast = dummy, dummy

    for _ in range(n):
        fast = fast.next

    while fast.next:
        slow = slow.next
        fast = fast.next

    slow.next = slow.next.next
    return dummy.next`,
          getHighlightLines(step) {
            if (step.type === 'init')         return [2, 3]
            if (step.type === 'advance-fast') return [5, 6]
            if (step.type === 'move-both')    return [8, 9, 10]
            if (step.type === 'remove')       return [12]
            if (step.type === 'done')         return [13]
            return []
          },
        },
      },
    ],
  },
}
