import { useMemo, useEffect, useState } from 'react'
import { buildBestTimeStockSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = [7, 1, 5, 3, 6, 4]

export default function BestTimeStockVisualizer({ onStepChange }) {
  const [prices, setPrices] = useState(DEFAULT)
  const [draft,  setDraft]  = useState(DEFAULT.join(', '))
  const [error,  setError]  = useState(null)

  const steps  = useMemo(() => buildBestTimeStockSteps(prices), [prices])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun(text = draft) {
    const r = parseIntList(text)
    if (r.error) { setError(r.error); return }
    if (r.value.some((n) => n < 0)) { setError('Prices cannot be negative.'); return }
    setError(null)
    setPrices(r.value)
    setTimeout(() => reset(), 0)
  }

  const example = (arr) => ({ label: `[${arr.join(',')}]`, onClick: () => { setDraft(arr.join(', ')); handleRun(arr.join(',')) } })

  const isDone = step.type === 'done'
  const hasTrade = step.bestBuy >= 0

  function getState(idx) {
    if (isDone) return hasTrade && (idx === step.bestBuy || idx === step.bestSell) ? 'found' : 'dim'
    if (idx === step.i) return step.type === 'new-max' ? 'found' : step.type === 'new-min' ? 'mid' : 'active'
    if (idx === step.minIdx) return 'violet'
    if (step.i >= 0 && idx < step.i) return 'range'
    return 'pending'
  }

  function getTags(idx) {
    const tags = []
    if (isDone) {
      if (hasTrade && idx === step.bestBuy)  tags.push({ text: 'buy',  color: 'violet' })
      if (hasTrade && idx === step.bestSell) tags.push({ text: 'sell', color: 'emerald' })
      return tags
    }
    if (idx === step.minIdx) tags.push({ text: 'min', color: 'violet' })
    if (idx === step.i) tags.push({ text: 'i', color: 'blue' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Best Time to Buy and Sell Stock" subtitle="Remember the cheapest day so far — check what selling today would earn." />

      <InputPanel
        fields={[{ label: 'prices (comma separated, up to 16)', value: draft, onChange: setDraft, placeholder: '7, 1, 5, 3, 6, 4' }]}
        onRun={() => handleRun()}
        error={error}
        examples={[example(DEFAULT), example([7, 6, 4, 3, 1]), example([2, 4, 1, 7, 5, 11, 3])]}
      />

      <Panel
        title="prices"
        legend={[['#8b5cf6', 'min so far'], ['#3b82f6', 'current day'], ['#f59e0b', 'new min'], ['#10b981', 'new best']]}
      >
        <ArrayRow values={prices} getState={getState} getTags={getTags} />
        <Stats items={[
          ['minPrice', step.minPrice, 'violet'],
          ['today − min', step.profit ?? '—', 'blue'],
          ['maxProfit', step.maxProfit, 'emerald'],
        ]} />
      </Panel>

      <ResultBanner
        show={isDone}
        ok={hasTrade}
        title={`Max profit = ${step.maxProfit}`}
        detail={hasTrade
          ? `Buy day ${step.bestBuy} at ${prices[step.bestBuy]}, sell day ${step.bestSell} at ${prices[step.bestSell]}`
          : 'Prices only fall — best move is not to trade'}
      />

      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
