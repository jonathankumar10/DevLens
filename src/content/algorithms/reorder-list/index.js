export default {
  id: 'reorder-list',
  title: 'Reorder List',
  difficulty: 'Medium',
  pattern: 'Fast & Slow Pointers',
  category: 'linked-list',
  path: '/algorithms/reorder-list',
  description: 'Given the head of a singly linked list L0 → L1 → … → Ln, reorder it in-place to L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …. Only node links may change, not node values.',
  metaphor: 'Three classic moves chained together. First, fast/slow pointers find the middle. Second, the back half is reversed so its tail is now in front. Third, the two halves are zipped together like a shuffle of two card piles — one from the front, one from the back, alternating.',
  tags: ['linked-list', 'two-pointers', 'reversal'],
  problemUrl: 'https://leetcode.com/problems/reorder-list/',
  problemLabel: 'LeetCode #143',

  solution: {
    approaches: [
      {
        id: 'split-reverse-merge',
        label: 'Split · Reverse · Merge',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public void reorderList(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    ListNode mid = slow.next;
    slow.next = null;
    ListNode prev = null;
    while (mid != null) {
        ListNode temp = mid.next;
        mid.next = prev;
        prev = mid;
        mid = temp;
    }

    ListNode first = head;
    ListNode second = prev;
    while (second != null) {
        ListNode temp1 = first.next;
        ListNode temp2 = second.next;
        first.next = second;
        second.next = temp1;
        first = temp1;
        second = temp2;
    }
}`,
          getHighlightLines(step) {
            if (step.type === 'init')        return [2, 3]
            if (step.type === 'find-mid')    return [5, 6]
            if (step.type === 'split')       return [9, 10, 11]
            if (step.type === 'reverse')     return [13, 14, 15, 16]
            if (step.type === 'merge-start') return [19, 20]
            if (step.type === 'merge')       return [22, 23, 24, 25, 26, 27]
            if (step.type === 'done')        return [21]
            return []
          },
        },
        python: {
          code: `def reorderList(self, head: Optional[ListNode]) -> None:
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    mid = slow.next
    slow.next = None
    prev = None
    while mid:
        temp = mid.next
        mid.next = prev
        prev = mid
        mid = temp

    first, second = head, prev
    while second:
        temp1, temp2 = first.next, second.next
        first.next = second
        second.next = temp1
        first, second = temp1, temp2`,
          getHighlightLines(step) {
            if (step.type === 'init')        return [2]
            if (step.type === 'find-mid')    return [4, 5]
            if (step.type === 'split')       return [7, 8, 9]
            if (step.type === 'reverse')     return [11, 12, 13, 14]
            if (step.type === 'merge-start') return [16]
            if (step.type === 'merge')       return [18, 19, 20, 21]
            if (step.type === 'done')        return [17]
            return []
          },
        },
      },
    ],
  },
}
