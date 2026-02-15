import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { depositStore } from '../stores/DepositStore'
import { exchangeStore } from '../stores/ExchangeStore'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import styles from './AssetsPie.module.scss'
import { AssetsListTop } from './AssetsListTop'
import { ExchangeAssetsModal } from './ExchangeAssetsModal'
import { CircularProgress } from '@mui/material'
import { STYLES } from '../constants/styles'
import { useTheme } from '../contexts/ThemeContext'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#0088fe', '#ffbb28']

type PieData = { name: string, value: number }
export const AssetsPie = observer(function AssetsPie() {
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false)
  const { mode } = useTheme()

  const depositsTotal = depositStore.items.reduce((acc, { amount }) => acc + amount, 0)
  const exchangeTotal = exchangeStore.items.reduce((acc, { totalPrice }) => {
    const v = totalPrice !== undefined ? totalPrice : 0
    return acc + v
  }, 0)
  const data: PieData[] = []
  if (depositsTotal > 0) data.push({ name: 'Вклады', value: depositsTotal })
  if (exchangeTotal > 0) data.push({ name: 'Биржевые активы', value: exchangeTotal })


  const handlePieClick = (data: PieData) => {
    if (data && data.name === 'Биржевые активы') {
      setIsExchangeModalOpen(true)
    }
  }

  if (data.length === 0) {
    return <div className={styles.empty}>Нет данных для диаграммы</div>
  }

  const totalValue = depositsTotal + exchangeTotal

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
      {exchangeStore.isLoading ?
        <CircularProgress size={50} />
        :
        <div className={styles.chartWrapper} style={STYLES[mode].topBlockWrapper}>

          <ResponsiveContainer width="100%" minHeight={300}>

            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                onClick={handlePieClick}
                style={{ cursor: 'pointer' }}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(_, name, formatterPayload) => {
                  const cost = formatterPayload.payload?.value.toFixed(1)
                  return [`${Number(cost).toLocaleString('ru-RU')} ₽`, name]
                }}
              />
              <Legend
                itemSorter={"value"}
                formatter={(value, legendPayload) => {
                  const percent = ((legendPayload.payload?.value / totalValue) * 100).toFixed(1)

                  const cost = legendPayload.payload?.value.toFixed(1)
                  return [value, `: ${Number(cost).toLocaleString('ru-RU')} ₽(${percent}%)`]
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      }

      < AssetsListTop />

      <ExchangeAssetsModal
        open={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />
    </div >
  )
})


