export default {
  id: 'reverse-linked-list',
  title: 'Reverse Linked List',
  difficulty: 'Easy',
  pattern: 'Linked List',
  category: 'linked-list',
  description:
    'Reverse a singly linked list in-place and return the new head.',
  metaphor:
    'Picture a chain of rail cars on a track. You stand at the engine, uncouple each car from the train ahead, and hook it onto the growing reversed train forming behind you. When you reach the last car, every coupling faces the opposite direction.',
  tags: ['linked-list', 'in-place', 'two-pointers'],
  problemUrl: 'https://leetcode.com/problems/reverse-linked-list/',
  problemLabel: 'LeetCode #206',

  solution: {
    approaches: [
      {
        id: 'iterative',
        label: 'Iterative',
        complexity: { time: 'O(n)', space: 'O(1)' },

        python: {
          code: `def reverseList(self, head: ListNode) -> ListNode:
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
          getHighlightLines(step) {
            if (step.type === 'init')       return [2, 3]
            if (step.type === 'save-next')  return [5]
            if (step.type === 'flip')       return [6, 7, 8]
            if (step.type === 'done')       return [9]
            return []
          },
        },

        java: {
          code: `public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode nextNode = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextNode;
    }
    return prev;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')       return [2, 3]
            if (step.type === 'save-next')  return [5]
            if (step.type === 'flip')       return [6, 7, 8]
            if (step.type === 'done')       return [10]
            return []
          },
        },
      },
    ],
  },
}
