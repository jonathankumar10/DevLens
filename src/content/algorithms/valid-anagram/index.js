export default {
  id: 'valid-anagram',
  title: 'Valid Anagram',
  difficulty: 'Easy',
  pattern: 'Hash Map',
  category: 'arrays-hashing',
  path: '/algorithms/valid-anagram',
  description: 'Given two strings s and t, return true if t is an anagram of s — that is, t uses exactly the same letters as s, the same number of times — and false otherwise.',
  metaphor: 'One tally sheet, two hands. As we walk both strings together, every letter from s adds a tick and every letter from t erases one. If the strings are anagrams, every tick gets erased and the sheet ends up all zeros.',
  tags: ['hash-map', 'string', 'counting'],
  problemUrl: 'https://leetcode.com/problems/valid-anagram/',
  problemLabel: 'LeetCode #242',

  solution: {
    approaches: [
      {
        id: 'counting',
        label: 'Hash Map Count',
        complexity: { time: 'O(n)', space: 'O(k)' },
        java: {
          code: `public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) {
        return false;
    }

    HashMap<Character, Integer> count = new HashMap<>();
    for (int i = 0; i < s.length(); i++) {
        count.put(s.charAt(i), count.getOrDefault(s.charAt(i), 0) + 1);
        count.put(t.charAt(i), count.getOrDefault(t.charAt(i), 0) - 1);
    }

    for (char c : count.keySet()) {
        if (count.get(c) != 0) {
            return false;
        }
    }

    return true;
}`,
          getHighlightLines(step) {
            if (step.type === 'length-mismatch') return [2, 3]
            if (step.type === 'init')            return [6]
            if (step.type === 'count')           return [7, 8, 9]
            if (step.type === 'check-ok')        return [12, 13]
            if (step.type === 'check-fail')      return [13, 14]
            if (step.type === 'valid')           return [18]
            return []
          },
        },
        python: {
          code: `def isAnagram(self, s: str, t: str) -> bool:
    if len(s) != len(t):
        return False

    count = {}
    for i in range(len(s)):
        count[s[i]] = count.get(s[i], 0) + 1
        count[t[i]] = count.get(t[i], 0) - 1

    for c in count:
        if count[c] != 0:
            return False

    return True`,
          getHighlightLines(step) {
            if (step.type === 'length-mismatch') return [2, 3]
            if (step.type === 'init')            return [5]
            if (step.type === 'count')           return [6, 7, 8]
            if (step.type === 'check-ok')        return [10, 11]
            if (step.type === 'check-fail')      return [11, 12]
            if (step.type === 'valid')           return [14]
            return []
          },
        },
      },
      {
        id: 'sorting',
        label: 'Sorting',
        complexity: { time: 'O(n log n)', space: 'O(n)' },
        java: {
          code: `public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) {
        return false;
    }

    char[] sArray = s.toCharArray();
    char[] tArray = t.toCharArray();
    Arrays.sort(sArray);
    Arrays.sort(tArray);

    return Arrays.equals(sArray, tArray);
}`,
          getHighlightLines(step) {
            if (step.type === 'length-mismatch') return [2, 3]
            if (step.type === 'init')            return [6, 7, 8, 9]
            if (['valid', 'check-fail'].includes(step.type)) return [11]
            return []
          },
        },
        python: {
          code: `def isAnagram(self, s: str, t: str) -> bool:
    if len(s) != len(t):
        return False

    return sorted(s) == sorted(t)`,
          getHighlightLines(step) {
            if (step.type === 'length-mismatch') return [2, 3]
            if (['valid', 'check-fail'].includes(step.type)) return [5]
            return []
          },
        },
      },
    ],
  },
}
