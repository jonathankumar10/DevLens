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

const DIFFICULTY_ORDER = ['Easy', 'Medium', 'Hard']

// Same category grouping as groupByCategory, but each category is further
// split into Easy/Medium/Hard subgroups — lets a pattern's problems in the
// sidebar be worked top-to-bottom from prereq-easy up to the hardest.
export function groupByCategoryAndDifficulty(items, categoryLabels, basePath) {
  const order = []
  const byCategory = new Map()

  for (const item of items) {
    if (!byCategory.has(item.category)) {
      byCategory.set(item.category, new Map())
      order.push(item.category)
    }
    const byDifficulty = byCategory.get(item.category)
    if (!byDifficulty.has(item.difficulty)) byDifficulty.set(item.difficulty, [])
    byDifficulty.get(item.difficulty).push({
      id:           item.id,
      title:        item.title,
      path:         `${basePath}/${item.id}`,
      problemUrl:   item.problemUrl,
      problemLabel: item.problemLabel,
      difficulty:   item.difficulty,
    })
  }

  return order.map((category) => {
    const byDifficulty = byCategory.get(category)
    const subgroups = DIFFICULTY_ORDER
      .filter((d) => byDifficulty.has(d))
      .map((d) => ({ key: d, label: d, items: byDifficulty.get(d) }))

    return {
      key:   category,
      label: categoryLabels[category] ?? category,
      items: subgroups.flatMap((sg) => sg.items),
      subgroups,
    }
  })
}
