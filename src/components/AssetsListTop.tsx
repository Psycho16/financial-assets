import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { exchangeStore } from '../stores/ExchangeStore'
import styles from './AssetsListTop.module.scss'
import { Chip, Stack } from '@mui/material'
import { useTheme } from '../contexts/ThemeContext'
import { STYLES } from '../constants/styles'

const ACCEPTED_PERCENTS = [0, 1, 5, 10]

type TopType = "fallen" | "grown"
const LABEL_BY_TYPE: Record<string, string> = {
  fallen: "Падения",
  grown: "Взлеты",
}

export const AssetsListTop = observer(function AssetsListTop() {
  const [percent, setPercent] = useState(10)
  const [topType, setTopType] = useState<TopType>("fallen")
  const { mode } = useTheme()

  const topFive = useMemo(() => {
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

    const isFallen = topType === "fallen"

    const below5 = items.filter(x => isFallen ? x.percent <= -percent : x.percent >= percent)
    below5.sort((a, b) => isFallen ? a.percent - b.percent : b.percent - a.percent)
    return below5.slice(0, 5)
  }, [exchangeStore.items, percent, topType])

  return (
    <div className={styles.ListTopWrapper} style={STYLES[mode].topBlockWrapper}>
      <Stack spacing={1} direction={"column"} justifyContent={"flex-start"}>
        <Stack spacing={1} direction={"row"}>
          {Object.entries(LABEL_BY_TYPE).map(([type, label]) => {
            return (
              <Chip
                key={type}
                label={label}
                onClick={() => {
                  if (type !== "fallen" && type !== "grown") return
                  setTopType(type)
                }}
                variant={topType === type ? "filled" : "outlined"}
              />
            )
          })}
          {/* <Chip
            key={"fallen"}
            label={`Падения`}
            onClick={() => {
              setType("fallen")
            }}
            variant={type === "fallen" ? "filled" : "outlined"}
          /> */}
        </Stack>
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
      </Stack>
      <div className={styles.title}>{`${LABEL_BY_TYPE[topType]} за день (топ 5${percent > 0 ? `, Больше ${percent}%` : ``})`}</div>
      <div className={styles.items}>
        {topFive.length === 0 ? (
          <div className={styles.empty}>Нет падений более {percent}% сегодня</div>
        ) : (
          topFive.map((x) => (
            <div key={x.ticker} className={styles.item} style={STYLES[mode].item}>
              <div>{x.name}</div>
              <div className={styles.ticker}>{x.ticker}</div>
              <div className={topType === "fallen" ? styles.percentDown : styles.percentUp}>{x.percent.toFixed(2)}%</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})


