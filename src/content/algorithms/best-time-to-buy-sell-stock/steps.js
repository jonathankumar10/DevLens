/**
 * Step builder for LeetCode #121 — Best Time to Buy and Sell Stock.
 *
 * Step types:
 *   init    — minPrice = prices[0], maxProfit = 0
 *   new-max — selling today beats the best profit so far
 *   new-min — today is the cheapest day yet → it becomes the buy day
 *   check   — neither a better sale nor a cheaper buy
 *   done    — return maxProfit
 *
 * Each step carries the current buy day (minIdx) and the best trade
 * [bestBuy, bestSell] seen so far (-1 when no profitable trade exists).
 */
export function buildBestTimeStockSteps(prices) {
  const steps = []
  let minPrice = prices[0]
  let minIdx = 0
  let maxProfit = 0
  let bestBuy = -1
  let bestSell = -1

  const push = (type, i, profit, message) => {
    steps.push({ type, prices, i, profit, minPrice, minIdx, maxProfit, bestBuy, bestSell, message })
  }

  push('init', -1, null, `minPrice = prices[0] = ${minPrice}, maxProfit = 0. Scan from day 1.`)

  for (let i = 1; i < prices.length; i++) {
    const price = prices[i]
    const profit = price - minPrice
    if (profit > maxProfit) {
      maxProfit = profit
      bestBuy = minIdx
      bestSell = i
      push('new-max', i, profit, `Sell at ${price} after buying at ${minPrice} → profit ${profit}. New best! maxProfit = ${maxProfit}.`)
    } else if (price < minPrice) {
      const old = minPrice
      minPrice = price
      minIdx = i
      push('new-min', i, profit, `${price} is cheaper than ${old}. Any future sale does better buying here, so minPrice = ${price} (day ${i}).`)
    } else {
      push('check', i, profit, `Sell at ${price} → profit ${profit}, not better than ${maxProfit}. ${price} is not cheaper than ${minPrice} either. Move on.`)
    }
  }

  push('done', -1, null, maxProfit > 0
    ? `Done. Buy on day ${bestBuy} at ${prices[bestBuy]}, sell on day ${bestSell} at ${prices[bestSell]} → maxProfit = ${maxProfit}.`
    : 'Done. Prices never rose after a low, so no profitable trade exists → maxProfit = 0.')
  return steps
}
