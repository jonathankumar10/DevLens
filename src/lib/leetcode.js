// "LeetCode #200" -> "200" — falls back to the full label if it doesn't match.
export function leetcodeNumber(label) {
  return label?.match(/#(\d+)/)?.[1] ?? label
}
