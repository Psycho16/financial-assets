import { useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { exchangeStore } from '../stores/ExchangeStore'
import { moexStore } from '../stores/MoexStore'
import styles from './AssetsPie.module.scss'

const PERCENT = 5
export const FallenAssetsList = observer(function FallenAssetsList() {
  useEffect(() => {
    const tickers = Array.from(new Set(exchangeStore.items.map(x => x.ticker).filter(Boolean) as string[]))
    for (const t of tickers) {
      moexStore.fetchSharePrice(t)
    }
  }, [exchangeStore.items.length])

  const fallen = useMemo(() => {
    const items = exchangeStore.items
      .map(it => {
        const ticker = it.ticker?.toUpperCase()
        const pct = moexStore.getChangePercent(ticker)
        return {
          name: it.name,
          ticker: ticker ?? '',
          percent: pct,
        }
      })
      .filter(x => x.ticker && x.percent !== undefined && Number.isFinite(x.percent)) as { name: string; ticker: string; percent: number }[]

    const below5 = items.filter(x => x.percent <= -PERCENT)
    below5.sort((a, b) => a.percent - b.percent)
    return below5.slice(0, 5)
  }, [exchangeStore.items, moexStore.changePercents.size])

  return (
    <div className={styles.fallenListWrapper}>
      <div className={styles.fallenTitle}>Падения за день (топ 5, Больше {PERCENT}%)</div>
      <div className={styles.fallenItems}>
        {fallen.length === 0 ? (
          <div className={styles.empty}>Нет падений более {PERCENT}% сегодня</div>
        ) : (
          fallen.map((x) => (
            <div key={x.ticker} className={styles.fallenItem}>
              <div>{x.name}</div>
              <div className={styles.fallenTicker}>{x.ticker}</div>
              <div className={styles.fallenPercentDown}>{x.percent.toFixed(2)}%</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})


