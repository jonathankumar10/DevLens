export default {
  id: 'best-time-to-buy-sell-stock',
  title: 'Best Time to Buy and Sell Stock',
  difficulty: 'Easy',
  pattern: 'Sliding Window',
  category: 'sliding-window',
  description: 'You are given an array prices where prices[i] is the price of a stock on day i. Choose one day to buy and a later day to sell to maximize profit. Return the maximum profit, or 0 if no profit is possible.',
  metaphor: 'Walk through the price chart day by day, keeping a note of the cheapest price you have seen so far. On each new day, ask: "If I had bought at that cheapest day and sold today, how much would I make?" Keep the best answer. Whenever today is even cheaper, cross out the old note and write today down. You never need to look back, so one pass is enough.',
  tags: ['array', 'sliding-window', 'greedy'],
  problemUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
  problemLabel: 'LeetCode #121',

  solution: {
    approaches: [
      {
        id: 'one-pass',
        label: 'One Pass (track min)',
        complexity: { time: 'O(n)', space: 'O(1)' },
        java: {
          code: `public int maxProfit(int[] prices) {
    int minPrice = prices[0];
    int maxProfit = 0;

    for (int i = 1; i < prices.length; i++) {
        maxProfit = Math.max(maxProfit, prices[i] - minPrice);
        minPrice = Math.min(minPrice, prices[i]);
    }

    return maxProfit;
}`,
          getHighlightLines(step) {
            if (step.type === 'init')    return [2, 3]
            if (step.type === 'new-max') return [5, 6]
            if (step.type === 'new-min') return [5, 7]
            if (step.type === 'check')   return [5, 6, 7]
            if (step.type === 'done')    return [10]
            return []
          },
        },
        python: {
          code: `def maxProfit(self, prices: List[int]) -> int:
    min_price = prices[0]
    max_profit = 0

    for price in prices[1:]:
        max_profit = max(max_profit, price - min_price)
        min_price = min(min_price, price)

    return max_profit`,
          getHighlightLines(step) {
            if (step.type === 'init')    return [2, 3]
            if (step.type === 'new-max') return [5, 6]
            if (step.type === 'new-min') return [5, 7]
            if (step.type === 'check')   return [5, 6, 7]
            if (step.type === 'done')    return [9]
            return []
          },
        },
      },
    ],
  },
}
