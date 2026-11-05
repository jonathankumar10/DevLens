export default {
  id: 'bfs',
  title: 'Breadth-First Search',
  difficulty: 'Medium',
  pattern: 'Graph Traversal',
  category: 'graphs',
  description: 'Given an m × n 2D binary grid of "1"s (land) and "0"s (water), return the number of islands. An island is formed by connecting adjacent land cells horizontally or vertically, and is surrounded by water.',
  metaphor: 'We picture the grid as a city where each land cell is a district. A car starts at one district and drives outward level by level — exactly how BFS explores a graph.',
  tags: ['graph', 'queue', 'bfs'],
  problemUrl: 'https://leetcode.com/problems/number-of-islands/',
  problemLabel: 'LeetCode #200',

  solution: {
    approaches: [
      {
        id: 'bfs-queue',
        label: 'BFS (Queue)',
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        java: {
          code: `public int numIslands(char[][] grid) {
    int ROWS = grid.length;
    int COLS = grid[0].length;
    int numOfIslands = 0;
    boolean[][] visited = new boolean[ROWS][COLS];
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            if (grid[i][j] == '1' && !visited[i][j]) {
                bfs(grid, i, j, visited);
                numOfIslands++;
            }
        }
    }
    return numOfIslands;
}

private final int[][] directions = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };

private void bfs(char[][] grid, int rows, int cols, boolean[][] visited) {
    LinkedList<int[]> queue = new LinkedList<>();
    queue.add(new int[] { rows, cols });
    visited[rows][cols] = true;

    while (!queue.isEmpty()) {
        int[] node = queue.poll();
        int row = node[0];
        int col = node[1];

        for (int[] dir : directions) {
            int nr = row + dir[0];
            int nc = col + dir[1];

            if (nr >= 0 && nc >= 0 && nr < grid.length
                    && nc < grid[0].length
                    && grid[nr][nc] == '1' && !visited[nr][nc]) {
                queue.add(new int[] { nr, nc });
                visited[nr][nc] = true;
            }
        }
    }
}`,
          getHighlightLines(step) {
            const isInit     = step.current == null && step.queue?.length > 0
            const isComplete = step.current == null && step.queue?.length === 0
            const isVisiting = step.current != null && !step.enqueuing
            const isEnqueue  = step.current != null && step.enqueuing != null

            if (isInit)     return [19, 20, 21]
            if (isComplete) return [23]
            if (isVisiting) return [23, 24, 25, 26]
            if (isEnqueue)  return [28, 31, 32, 33, 34, 35]
            return []
          },
        },
        python: {
          code: `def bfs(start):
    visited = set([start])
    queue = deque([start])

    while queue:
        node = queue.popleft()
        process(node)

        for neighbor in node.neighbors:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
          getHighlightLines(step) {
            const isInit     = step.current == null && step.queue?.length > 0
            const isComplete = step.current == null && step.queue?.length === 0
            const isVisiting = step.current != null && !step.enqueuing
            const isEnqueue  = step.current != null && step.enqueuing != null

            if (isInit)     return [2, 3]
            if (isComplete) return [5]
            if (isVisiting) return [5, 6, 7]
            if (isEnqueue)  return [9, 10, 11, 12]
            return []
          },
        },
      },
    ],
  },
}
