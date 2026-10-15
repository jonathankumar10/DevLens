// Looks up an item by id and returns it with its previous/next siblings, for
// detail pages that link to the adjacent item. Missing neighbors are null.
export function findWithNeighbors(items, id) {
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return { item: null, prevItem: null, nextItem: null }

  return {
    item:     items[index],
    prevItem: items[index - 1] ?? null,
    nextItem: items[index + 1] ?? null,
  }
}
