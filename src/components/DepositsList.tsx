import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { depositStore, type Deposit } from '../stores/DepositStore'
import styles from './DepositsList.module.scss'
import TextField from '@mui/material/TextField'
import { formatNumber } from '../utils/numberFormat'

type EditingState = { [id: string]: Partial<Pick<Deposit, 'name' | 'endDate' | 'amount' | 'ratePercent'>> }

export const DepositsList = observer(function DepositsList() {
  const [editing, setEditing] = useState<EditingState>({})

  const startEdit = (item: Deposit) => {
    setEditing(prev => ({
      ...prev,
      [item.id]: {
        name: item.name,
        endDate: item.endDate,
        amount: item.amount,
        ratePercent: item.ratePercent,
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
    const c = editing[id]
    if (!c) return
    const amt = Number(c.amount)
    const rate = Number(c.ratePercent)
    if (!Number.isFinite(amt) || amt <= 0 || !Number.isFinite(rate) || rate < 0) return
    depositStore.update(id, {
      name: String(c.name ?? '').trim(),
      endDate: String(c.endDate ?? ''),
      amount: amt,
      ratePercent: rate,
    })
    cancelEdit(id)
  }

  if (depositStore.items.length === 0) {
    return <div className={styles.empty}>Нет вкладов</div>
  }

  return (
    <div className={styles.list}>
      {depositStore.items.map(item => {
        const e = editing[item.id]
        const isEditing = Boolean(e)
        return (
          <div key={item.id} className={styles.row}>
            {isEditing ? (
              <>
                <TextField size="small" label="Название" value={String(e.name ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], name: ev.target.value } }))} />
                <TextField size="small" label="Дата окончания" type="date" value={String(e.endDate ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], endDate: ev.target.value } }))} InputLabelProps={{ shrink: true }} />
                <TextField size="small" label="Сумма" type="number" inputProps={{ min: '0', step: '0.01' }} value={String(e.amount ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], amount: Number(ev.target.value) } }))} />
                <TextField size="small" label="Процент, %" type="number" inputProps={{ min: '0', step: '0.01' }} value={String(e.ratePercent ?? '')} onChange={ev => setEditing(s => ({ ...s, [item.id]: { ...s[item.id], ratePercent: Number(ev.target.value) } }))} />
                <div className={styles.actions}>
                  <button onClick={() => saveEdit(item.id)} className={styles.save}>Сохранить</button>
                  <button onClick={() => cancelEdit(item.id)} className={styles.cancel}>Отмена</button>
                </div>
              </>
            ) : (
              <>
                <div>{item.name}</div>
                <div className={styles.cellMono}>{item.endDate}</div>
                <div className={styles.cellMono}>{formatNumber(item.amount)}</div>
                <div className={styles.cellMono}>{formatNumber(item.ratePercent, { fractionDigits: 2 })}%</div>
                <div className={styles.actions}>
                  <button onClick={() => startEdit(item)} className={styles.edit}>Изменить</button>
                  <button onClick={() => depositStore.remove(item.id)} className={styles.remove}>Удалить</button>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
})


