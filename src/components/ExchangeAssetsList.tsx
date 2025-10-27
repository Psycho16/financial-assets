import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { exchangeStore, type ExchangeAsset } from '../stores/ExchangeStore'
import { moexStore } from '../stores/MoexStore'
import styles from './ExchangeAssetsList.module.scss'
import TextField from '@mui/material/TextField'
import { formatNumber } from '../utils/numberFormat'

type EditingState = {
  [id: string]: Partial<Pick<ExchangeAsset, 'name' | 'ticker' | 'category' | 'sector' | 'quantity'>>
}

export const ExchangeAssetsList = observer(function ExchangeAssetsList() {
  const [editing, setEditing] = useState<EditingState>({})

  useEffect(() => {
    const tickers = Array.from(new Set(exchangeStore.items.map(x => x.ticker).filter(Boolean) as string[]))
    for (const t of tickers) {
      moexStore.fetchSharePrice(t)
    }
  }, [exchangeStore.items.length])

  const startEdit = (item: ExchangeAsset) => {
    setEditing(prev => ({
      ...prev,
      [item.id]: {
        name: item.name,
        ticker: item.ticker ?? '',
        category: item.category,
        sector: item.sector,
        quantity: item.quantity,
      },
    }))
  }

  const cancelEdit = (id: string) => {
    setEditing(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const saveEdit = (id: string) => {
    const changes = editing[id]
    if (!changes) return
    const qty = Number(changes.quantity)
    if (!Number.isFinite(qty) || qty <= 0) return
    exchangeStore.update(id, {
      name: String(changes.name ?? '').trim(),
      ticker: String(changes.ticker ?? '').trim() || undefined,
      category: String(changes.category ?? 'Прочее').trim() || 'Прочее',
      sector: String(changes.sector ?? 'Прочее').trim() || 'Прочее',
      quantity: qty,
    })
    cancelEdit(id)
  }

  if (exchangeStore.items.length === 0) {
    return <div className={styles.empty}>Нет биржевых активов</div>
  }

  const totalValue = exchangeStore.items.reduce((sum, it) => {
    const p = moexStore.getPrice(it.ticker)
    const v = p !== undefined ? p * it.quantity : 0
    return sum + v
  }, 0)

  return (
    <div className={styles.list}>
      {exchangeStore.items.map(item => {
        const e = editing[item.id]
        const isEditing = Boolean(e)
        const price = moexStore.getPrice(item.ticker)
        const positionValue = price !== undefined ? price * item.quantity : undefined
        return (
          <div key={item.id} className={styles.row}>
            {isEditing ? (
              <>
                <TextField size="small" label="Название" value={String(e.name ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], name: ev.target.value } }))} />
                <TextField size="small" label="Тикер" value={String(e.ticker ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], ticker: ev.target.value } }))} />
                <TextField size="small" label="Категория" value={String(e.category ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], category: ev.target.value } }))} />
                <TextField size="small" label="Отрасль" value={String(e.sector ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], sector: ev.target.value } }))} />
                <TextField size="small" label="Количество" type="number" inputProps={{ min: '0', step: '1' }} value={String(e.quantity ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], quantity: Number(ev.target.value) } }))} />
                <div className={styles.actions}>
                  <button onClick={() => saveEdit(item.id)} className={styles.save}>Сохранить</button>
                  <button onClick={() => cancelEdit(item.id)} className={styles.cancel}>Отмена</button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.cellStrong}>{item.name}</div>
                <div className={styles.cellMono}>{item.ticker ?? '-'}</div>
                <div>{item.category}</div>
                <div>{item.sector}</div>
                <div className={styles.cellMono}>{formatNumber(item.quantity, { fractionDigits: 0 })}</div>
                <div className={styles.cellMono}>{price !== undefined ? formatNumber(price) : '-'}</div>
                <div className={styles.cellMono}>{positionValue !== undefined ? formatNumber(positionValue) : '-'}</div>
                <div className={styles.actions}>
                  <button onClick={() => startEdit(item)} className={styles.edit}>Изменить</button>
                  <button onClick={() => exchangeStore.remove(item.id)} className={styles.remove}>Удалить</button>
                </div>
              </>
            )}
          </div>
        )
      })}
      <div className={styles.footerRow}>
        <div className={styles.cellStrong}>Итого</div>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div className={styles.cellMono}>{formatNumber(totalValue)}</div>
        <div />
      </div>
    </div>
  )
})



