import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { assetStore } from '../stores/AssetStore'
import { depositStore } from '../stores/DepositStore'
import { exchangeStore } from '../stores/ExchangeStore'
import { moexStore } from '../stores/MoexStore'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import styles from './AssetsPie.module.scss'
import { FallenAssetsList } from './FallenAssetsList'
import { ExchangeAssetsModal } from './ExchangeAssetsModal'
import { CircularProgress } from '@mui/material'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#0088fe', '#ffbb28']


export const AssetsPie = observer(function AssetsPie() {
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false)

  const base = Object.entries(assetStore.totalsByCategory).map(([name, value]) => ({ name, value }))
  const depositsTotal = depositStore.items.reduce((s, d) => s + d.amount, 0)
  const exchangeTotal = exchangeStore.items.reduce((s, it) => {
    const p = moexStore.getPrice(it.ticker)
    const v = p !== undefined ? p * it.quantity : 0
    return s + v
  }, 0)
  const extra = [] as { name: string, value: number }[]
  if (depositsTotal > 0) extra.push({ name: 'Вклады', value: depositsTotal })
  if (exchangeTotal > 0) extra.push({ name: 'Биржевые активы', value: exchangeTotal })
  const data = [...base, ...extra]

  const handlePieClick = (data: any) => {
    if (data && data.name === 'Биржевые активы') {
      setIsExchangeModalOpen(true)
    }
  }

  if (data.length === 0) {
    return <div className={styles.empty}>Нет данных для диаграммы</div>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
      {moexStore.loading.size !== 0 ?
        <CircularProgress size={50} />
        :
        <div className={styles.chartWrapper}>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                onClick={handlePieClick}
                style={{ cursor: 'pointer' }}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => Number(v).toLocaleString('ru-RU')} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      }

      <FallenAssetsList />

      <ExchangeAssetsModal
        open={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />
    </div>
  )
})


