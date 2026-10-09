export default {
  id: 'clone-graph',
  title: 'Clone Graph',
  difficulty: 'Medium',
  pattern: 'Graph BFS + Hash Map',
  category: 'graphs',
  path: '/algorithms/clone-graph',
  description: 'Given a reference to a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node has a value and a list of its neighbors.',
  metaphor: 'A photocopier with a ledger. The ledger maps every original node to its copy, so nothing is ever copied twice. BFS walks the original graph: each time it meets a neighbor with no ledger entry, it makes a copy and queues the original for later. Either way, it wires the current copy to the neighbor\'s copy.',
  tags: ['graph', 'bfs', 'hash-map'],
  problemUrl: 'https://leetcode.com/problems/clone-graph/',
  problemLabel: 'LeetCode #133',

  solution: {
    approaches: [
      {
        id: 'bfs',
        label: 'BFS + Hash Map',
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        java: {
          code: `public Node cloneGraph(Node node) {
    if (node == null) {
        return null;
    }

    Map<Node, Node> map = new HashMap<>();
    Queue<Node> queue = new LinkedList<>();
    map.put(node, new Node(node.val));
    queue.add(node);

    while (!queue.isEmpty()) {
        Node curr = queue.poll();
        for (Node neighbor : curr.neighbors) {
            if (!map.containsKey(neighbor)) {
                map.put(neighbor, new Node(neighbor.val));
                queue.add(neighbor);
            }
            map.get(curr).neighbors.add(map.get(neighbor));
        }
    }

    return map.get(node);
}`,
          getHighlightLines(step) {
            if (step.type === 'empty')          return [2, 3]
            if (step.type === 'init')           return [6, 7, 8, 9]
            if (step.type === 'poll')           return [11, 12]
            if (step.type === 'clone-neighbor') return [13, 14, 15, 16, 18]
            if (step.type === 'link-existing')  return [13, 14, 18]
            if (step.type === 'done')           return [22]
            return []
          },
        },
        python: {
          code: `def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
    if not node:
        return None

    clones = {node: Node(node.val)}
    queue = deque([node])

    while queue:
        curr = queue.popleft()
        for neighbor in curr.neighbors:
            if neighbor not in clones:
                clones[neighbor] = Node(neighbor.val)
                queue.append(neighbor)
            clones[curr].neighbors.append(clones[neighbor])

    return clones[node]`,
          getHighlightLines(step) {
            if (step.type === 'empty')          return [2, 3]
            if (step.type === 'init')           return [5, 6]
            if (step.type === 'poll')           return [8, 9]
            if (step.type === 'clone-neighbor') return [10, 11, 12, 13, 14]
            if (step.type === 'link-existing')  return [10, 11, 14]
            if (step.type === 'done')           return [16]
            return []
          },
        },
      },
    ],
  },
}
