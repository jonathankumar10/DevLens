export default {
  id: 'remove-element',
  title: 'Remove Element',
  difficulty: 'Easy',
  pattern: 'Two Pointers',
  category: 'arrays-hashing',
  description: 'Given an integer array nums and an integer val, remove all occurrences of val in-place. Return k — the count of elements not equal to val. The first k elements of nums must hold those values.',
  metaphor: 'We use two runners on a track: a reader (i) sprints ahead, and a writer (k) trails behind. Whenever the reader steps on a tile marked val they leap over it; otherwise they hand the tile to the writer and both advance one step.',
  tags: ['array', 'two-pointers', 'in-place'],
  problemUrl: 'https://leetcode.com/problems/remove-element/',
  problemLabel: 'LeetCode #27',

  solution: {
    approaches: [
      {
        id: 'two-pointer',
        label: 'Two Pointers',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int removeElement(int[] nums, int val) {
    int counter = 0;
    for(int i = 0; i < nums.length; i++){
        if(nums[i] == val){
            continue;
        }else{
            nums[counter] = nums[i];
            counter++;
        }
    }
    return counter;
}`,
          getHighlightLines(step) {
            if (step.type === 'init') return [2]
            if (step.type === 'skip') return [4, 5]
            if (step.type === 'keep') return [4, 7, 8]
            if (step.type === 'done') return [11]
            return []
          },
        },
        python: {
          code: `def removeElement(self, nums: List[int], val: int) -> int:
    counter = 0
    for i in range(len(nums)):
        if nums[i] == val:
            continue
        else:
            nums[counter] = nums[i]
            counter += 1
    return counter`,
          getHighlightLines(step) {
            if (step.type === 'init') return [2]
            if (step.type === 'skip') return [4, 5]
            if (step.type === 'keep') return [4, 7, 8]
            if (step.type === 'done') return [9]
            return []
          },
        },
      },
    ],
  },
}
