export default {
  id: 'merge-sorted-lists',
  title: 'Merge Two Sorted Lists',
  difficulty: 'Easy',
  pattern: 'Linked List',
  category: 'linked-list',
  description:
    'Merge two sorted linked lists into one sorted list and return the head of the merged list.',
  metaphor:
    'Two checkout queues, both sorted by wait time. A single cashier keeps glancing at the front of each queue and always pulls the next customer from whichever line is shorter. When one queue empties, the other walks straight through.',
  tags: ['linked-list', 'two-pointers', 'merge'],
  problemUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
  problemLabel: 'LeetCode #21',

  solution: {
    approaches: [
      {
        id: 'iterative',
        label: 'Iterative',
        complexity: { time: 'O(m + n)', space: 'O(1)' },

        python: {
          code: `def mergeTwoLists(self, l1, l2):
    dummy = ListNode(0)
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 if l1 else l2
    return dummy.next`,
          getHighlightLines(step) {
            if (step.type === 'init')                         return [2, 3]
            if (step.type === 'pick' && step.chosen === 1)    return [4, 5, 6]
            if (step.type === 'pick' && step.chosen === 2)    return [7, 8, 9]
            if (step.type === 'drain')                        return [11]
            if (step.type === 'done')                         return [12]
            return []
          },
        },

        java: {
          code: `public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }
    curr.next = (l1 != null) ? l1 : l2;
    return dummy.next;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')                         return [2, 3]
            if (step.type === 'pick' && step.chosen === 1)    return [5, 6, 7]
            if (step.type === 'pick' && step.chosen === 2)    return [8, 9, 10]
            if (step.type === 'drain')                        return [13]
            if (step.type === 'done')                         return [14]
            return []
          },
        },
      },
    ],
  },
}
