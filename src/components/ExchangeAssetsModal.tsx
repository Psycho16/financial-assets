import { observer } from 'mobx-react-lite'
import { exchangeStore, type ExchangeAsset } from '../stores/ExchangeStore'
import { moexStore } from '../stores/MoexStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#0088fe', '#ffbb28', '#ff6b6b', '#4ecdc4', '#45b7d1']
const DEFAULT_PIE_TYPES: (keyof ExchangeAsset)[] = ["name", "category", "sector"]
const DEFAULT_PIE_TYPES_NAMES = ["Название", "Категория", "Отрасль"]

interface ExchangeAssetsModalProps {
  open: boolean
  onClose: () => void
}

export const ExchangeAssetsModal = observer(function ExchangeAssetsModal({ open, onClose }: ExchangeAssetsModalProps) {
  const [pieChartTypeIdx, setPieChartTypeIdx] = useState<number>(1)

  const getDataByKey = (pieChartKey: keyof ExchangeAsset) => {
    return exchangeStore.items.reduce((acc, item) => {
      const price = moexStore.getPrice(item.ticker)
      const value = price !== undefined ? price * item.quantity : 0

      if (value > 0) {
        const dataKey = item[pieChartKey] || 'Прочее'
        acc[dataKey] = (acc[dataKey] || 0) + value
      }

      return acc
    }, {} as Record<string, number>)
  }

  const categoryData = getDataByKey(DEFAULT_PIE_TYPES[pieChartTypeIdx])

  const chartData = Object.entries(categoryData).map(([pieChartKey, value]) => ({
    name: pieChartKey,
    value
  }))

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth >
      <DialogTitle>
        Биржевые активы
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{
        paddingTop: "10px !important"
      }}>
        <div style={{ height: 550, marginTop: 16 }}>
          {chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, opacity: 0.7 }}>
              Нет биржевых активов для отображения
            </div>
          ) : (
            <>
              <div style={{
                textAlign: 'center',
                marginBottom: 16,
                fontSize: 18,
                fontWeight: 600,
                display: 'flex',
                justifyContent: "space-between"
              }}>
                <p>
                  Общая стоимость: {totalValue.toLocaleString('ru-RU')} ₽
                </p>
                <Tabs value={pieChartTypeIdx} onChange={(_, value) => {
                  setPieChartTypeIdx(value)
                }}>
                  {DEFAULT_PIE_TYPES.map((c, idx) => (
                    <Tab key={c} label={DEFAULT_PIE_TYPES_NAMES[idx]} />
                  ))}
                </Tabs>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label={({ name, percent = 0 }: { name?: string, percent?: number }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Стоимость']}
                  />
                  {/* <Legend /> */}
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
})
