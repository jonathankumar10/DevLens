export default {
  id: 'linked-list-cycle',
  title: 'Linked List Cycle',
  difficulty: 'Easy',
  pattern: 'Fast & Slow Pointers',
  category: 'linked-list',
  path: '/algorithms/linked-list-cycle',
  description: 'Given the head of a linked list, determine whether the list contains a cycle — some node that can be reached again by continuously following next pointers. Return true if there is a cycle, otherwise false.',
  metaphor: 'A tortoise and a hare race down the list — the hare takes two steps for every one the tortoise takes. On a straight track the hare simply runs off the end. On a loop track the hare laps around and, since it gains one node per turn, it must eventually land on the tortoise.',
  tags: ['linked-list', 'two-pointers', 'floyd'],
  problemUrl: 'https://leetcode.com/problems/linked-list-cycle/',
  problemLabel: 'LeetCode #141',

  solution: {
    approaches: [
      {
        id: 'floyd',
        label: "Floyd's Tortoise & Hare",
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            return true;
        }
    }

    return false;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2, 3]
            if (step.type === 'move')     return [5, 6, 7]
            if (step.type === 'meet')     return [8, 9]
            if (step.type === 'no-cycle') return [5, 13]
            return []
          },
        },
        python: {
          code: `def hasCycle(self, head: Optional[ListNode]) -> bool:
    slow, fast = head, head

    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True

    return False`,
          getHighlightLines(step) {
            if (step.type === 'init')     return [2]
            if (step.type === 'move')     return [4, 5, 6]
            if (step.type === 'meet')     return [7, 8]
            if (step.type === 'no-cycle') return [4, 10]
            return []
          },
        },
      },
    ],
  },
}
