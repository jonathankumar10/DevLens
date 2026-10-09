export default {
  id: 'design-linked-list',
  title: 'Design Linked List',
  difficulty: 'Medium',
  pattern: 'Linked List Design',
  category: 'linked-list',
  path: '/algorithms/design-linked-list',
  description: 'Implement MyLinkedList with get(index), addAtHead(val), addAtTail(val), addAtIndex(index, val) and deleteAtIndex(index). Indices are 0-based; invalid indices return -1 (get) or do nothing.',
  metaphor: 'Two permanent bookends — a dummy head and a dummy tail — sit at either end of a doubly linked list. Because every real node always has a neighbour on both sides, every insert and delete is the same four-pointer rewire. No "is the list empty?" or "is this the first node?" special cases, ever.',
  tags: ['linked-list', 'design', 'doubly-linked-list', 'sentinel'],
  problemUrl: 'https://leetcode.com/problems/design-linked-list/',
  problemLabel: 'LeetCode #707',

  solution: {
    approaches: [
      {
        id: 'doubly-sentinel',
        label: 'Doubly Linked + Sentinels',
        complexity: { time: 'O(1) head/tail · O(n) by index', space: 'O(n)' },
        java: {
          code: `class MyLinkedList {
    ListNode head, tail;

    public MyLinkedList() {
        head = new ListNode(0);
        tail = new ListNode(0);
        head.next = tail;
        tail.prev = head;
    }

    public int get(int index) {
        ListNode temp = head.next;
        int count = 0;
        while (temp != tail) {
            if (count == index) return temp.val;
            temp = temp.next;
            count++;
        }
        return -1;
    }

    public void addAtHead(int val) {
        insertBetween(val, head, head.next);
    }

    public void addAtTail(int val) {
        insertBetween(val, tail.prev, tail);
    }

    public void addAtIndex(int index, int val) {
        ListNode temp = head.next;
        int count = 0;
        while (temp != tail && count < index) {
            temp = temp.next;
            count++;
        }
        if (count != index) return;
        insertBetween(val, temp.prev, temp);
    }

    public void deleteAtIndex(int index) {
        ListNode temp = head.next;
        int count = 0;
        while (temp != tail && count < index) {
            temp = temp.next;
            count++;
        }
        if (temp == tail) return;
        temp.prev.next = temp.next;
        temp.next.prev = temp.prev;
    }

    private void insertBetween(int val, ListNode prev, ListNode next) {
        ListNode curr = new ListNode(val);
        curr.prev = prev;
        curr.next = next;
        prev.next = curr;
        next.prev = curr;
    }
}`,
          getHighlightLines(step) {
            const insert = [54, 55, 56, 57, 58]
            if (step.type === 'init')              return [5, 6, 7, 8]
            if (step.type === 'get-walk')          return [14, 15, 16, 17]
            if (step.type === 'get-hit')           return [15]
            if (step.type === 'get-miss')          return [19]
            if (step.type === 'add-head')          return [23, ...insert]
            if (step.type === 'add-tail')          return [27, ...insert]
            if (step.type === 'index-walk')        return [33, 34, 35]
            if (step.type === 'add-index')         return [38, ...insert]
            if (step.type === 'add-index-invalid') return [37]
            if (step.type === 'delete-walk')       return [44, 45, 46]
            if (step.type === 'delete')            return [49, 50]
            if (step.type === 'delete-invalid')    return [48]
            return []
          },
        },
        python: {
          code: `class MyLinkedList:
    def __init__(self):
        self.head = ListNode(0)
        self.tail = ListNode(0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, index: int) -> int:
        temp, count = self.head.next, 0
        while temp is not self.tail:
            if count == index:
                return temp.val
            temp, count = temp.next, count + 1
        return -1

    def addAtHead(self, val: int) -> None:
        self._insert_between(val, self.head, self.head.next)

    def addAtTail(self, val: int) -> None:
        self._insert_between(val, self.tail.prev, self.tail)

    def addAtIndex(self, index: int, val: int) -> None:
        temp, count = self.head.next, 0
        while temp is not self.tail and count < index:
            temp, count = temp.next, count + 1
        if count != index:
            return
        self._insert_between(val, temp.prev, temp)

    def deleteAtIndex(self, index: int) -> None:
        temp, count = self.head.next, 0
        while temp is not self.tail and count < index:
            temp, count = temp.next, count + 1
        if temp is self.tail:
            return
        temp.prev.next = temp.next
        temp.next.prev = temp.prev

    def _insert_between(self, val, prev, nxt):
        curr = ListNode(val)
        curr.prev, curr.next = prev, nxt
        prev.next = curr
        nxt.prev = curr`,
          getHighlightLines(step) {
            const insert = [40, 41, 42, 43]
            if (step.type === 'init')              return [3, 4, 5, 6]
            if (step.type === 'get-walk')          return [10, 11, 13]
            if (step.type === 'get-hit')           return [11, 12]
            if (step.type === 'get-miss')          return [14]
            if (step.type === 'add-head')          return [17, ...insert]
            if (step.type === 'add-tail')          return [20, ...insert]
            if (step.type === 'index-walk')        return [24, 25]
            if (step.type === 'add-index')         return [28, ...insert]
            if (step.type === 'add-index-invalid') return [26, 27]
            if (step.type === 'delete-walk')       return [32, 33]
            if (step.type === 'delete')            return [36, 37]
            if (step.type === 'delete-invalid')    return [34, 35]
            return []
          },
        },
      },
    ],
  },
}
