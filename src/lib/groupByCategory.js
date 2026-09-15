// Groups a flat, ordered content array into category sections for sidebar nav —
// category order follows first appearance in `items`, not alphabetical, so it
// matches the curriculum order already encoded in each registry array.
export function groupByCategory(items, categoryLabels, basePath) {
  const order = []
  const byCategory = new Map()

  for (const item of items) {
    if (!byCategory.has(item.category)) {
      byCategory.set(item.category, [])
      order.push(item.category)
    }
    byCategory.get(item.category).push({
      id:           item.id,
      title:        item.title,
      path:         `${basePath}/${item.id}`,
      problemUrl:   item.problemUrl,
      problemLabel: item.problemLabel,
    })
  }

  return order.map((category) => ({
    key:   category,
    label: categoryLabels[category] ?? category,
    items: byCategory.get(category),
  }))
}
