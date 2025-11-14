import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { exchangeStore } from '../stores/ExchangeStore'
import styles from './AssetsPie.module.scss'
import { Chip, Stack } from '@mui/material'
import { useTheme } from '../contexts/ThemeContext'
import { STYLES } from '../constants/styles'

const ACCEPTED_PERCENTS = [0, 1, 5, 10]
export const FallenAssetsList = observer(function FallenAssetsList() {
  const [percent, setPercent] = useState(10)
  const { mode } = useTheme()

  const fallen = useMemo(() => {
    const items = exchangeStore.items
      .map(it => {
        const ticker = it.ticker?.toUpperCase()
        return {
          name: it.name,
          ticker: ticker ?? '',
          percent: it.changePercent,
        }
      })
      .filter(x => x.ticker && x.percent !== undefined && Number.isFinite(x.percent)) as { name: string; ticker: string; percent: number }[]

    const below5 = items.filter(x => x.percent <= -percent)
    below5.sort((a, b) => a.percent - b.percent)
    return below5.slice(0, 5)
  }, [exchangeStore.items, percent])

  return (
    <div className={styles.fallenListWrapper} style={STYLES[mode].topBlockWrapper}>
      <Stack spacing={1} direction={"row"}>
        {
          ACCEPTED_PERCENTS.map(perc => (
            <Chip
              key={perc}
              label={`${perc}%`}
              onClick={() => {
                setPercent(perc)
              }}
              variant={perc === percent ? "filled" : "outlined"}
            />
          ))
        }
      </Stack>
      <div className={styles.fallenTitle}>{`Падения за день (топ 5${percent > 0 ? `, Больше ${percent}%` : ``})`}</div>
      <div className={styles.fallenItems}>
        {fallen.length === 0 ? (
          <div className={styles.empty}>Нет падений более {percent}% сегодня</div>
        ) : (
          fallen.map((x) => (
            <div key={x.ticker} className={styles.fallenItem} style={STYLES[mode].fallenItem}>
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


