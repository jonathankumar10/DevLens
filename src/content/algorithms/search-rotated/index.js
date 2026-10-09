export default {
  id: 'search-rotated',
  title: 'Search in Rotated Sorted Array',
  difficulty: 'Medium',
  pattern: 'Binary Search',
  category: 'binary-search',
  path: '/algorithms/search-rotated',
  description: 'A sorted array of distinct integers has been rotated at an unknown pivot (e.g. [0,1,2,4,5,6,7] → [4,5,6,7,0,1,2]). Given the array and a target, return the index of target or -1 if it is not present, in O(log n) time.',
  metaphor: 'Two binary searches back to back. The first one finds the pivot — the smallest element, where the array "restarts". That splits the array into two plain sorted halves. One glance at the target tells us which half it must live in, and an ordinary binary search finishes the job.',
  tags: ['binary-search', 'array'],
  problemUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
  problemLabel: 'LeetCode #33',

  solution: {
    approaches: [
      {
        id: 'pivot-then-search',
        label: 'Find Pivot + Binary Search',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        java: {
          code: `public int search(int[] nums, int target) {
    int l = 0, r = nums.length - 1;
    while (l < r) {
        int m = l + (r - l) / 2;
        if (nums[m] > nums[r]) {
            l = m + 1;
        } else {
            r = m;
        }
    }
    int pivot = l;

    if (target >= nums[pivot] && target <= nums[nums.length - 1]) {
        return binarySearch(nums, pivot, nums.length - 1, target);
    }
    return binarySearch(nums, 0, pivot - 1, target);
}

private int binarySearch(int[] nums, int left, int right, int target) {
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            return mid;
        }
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')         return [2]
            if (step.type === 'pivot-right')  return [4, 5, 6]
            if (step.type === 'pivot-left')   return [4, 7, 8]
            if (step.type === 'pivot-found')  return [11]
            if (step.type === 'choose-right') return [13, 14]
            if (step.type === 'choose-left')  return [16]
            if (step.type === 'search-right') return [21, 25, 26]
            if (step.type === 'search-left')  return [21, 27, 28]
            if (step.type === 'found')        return [22, 23]
            if (step.type === 'not-found')    return [31]
            return []
          },
        },
        python: {
          code: `def search(self, nums: List[int], target: int) -> int:
    l, r = 0, len(nums) - 1
    while l < r:
        m = l + (r - l) // 2
        if nums[m] > nums[r]:
            l = m + 1
        else:
            r = m
    pivot = l

    if nums[pivot] <= target <= nums[-1]:
        return self.binarySearch(nums, target, pivot, len(nums) - 1)
    return self.binarySearch(nums, target, 0, pivot - 1)

def binarySearch(self, nums, target, left, right):
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
          getHighlightLines(step) {
            if (step.type === 'init')         return [2]
            if (step.type === 'pivot-right')  return [4, 5, 6]
            if (step.type === 'pivot-left')   return [4, 7, 8]
            if (step.type === 'pivot-found')  return [9]
            if (step.type === 'choose-right') return [11, 12]
            if (step.type === 'choose-left')  return [13]
            if (step.type === 'search-right') return [17, 20, 21]
            if (step.type === 'search-left')  return [17, 22, 23]
            if (step.type === 'found')        return [18, 19]
            if (step.type === 'not-found')    return [24]
            return []
          },
        },
      },
    ],
  },
}
