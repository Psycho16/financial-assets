import { type FormEvent, useState } from 'react'
import TextField from '@mui/material/TextField'
import { depositStore } from '../stores/DepositStore'
import styles from './DepositForm.module.scss'

export function DepositForm({ onCloseModal }: { onCloseModal: () => void }) {
  const [name, setName] = useState('')
  const [endDate, setEndDate] = useState('')
  const [amount, setAmount] = useState('')
  const [ratePercent, setRatePercent] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const amt = Number(amount)
    const rate = Number(ratePercent)
    if (!name.trim() || !endDate || !Number.isFinite(amt) || amt <= 0 || !Number.isFinite(rate) || rate < 0) return
    depositStore.add({
      name: name.trim(),
      endDate,
      amount: amt,
      ratePercent: rate,
    })
    setName('')
    setEndDate('')
    setAmount('')
    setRatePercent('')
    onCloseModal()
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>Добавить вклад</button>
      </div>
      <div className={styles.row}>
        <TextField label="Название" value={name} onChange={e => setName(e.target.value)} placeholder="Напр. Вклад в банке" size="medium" />
        <TextField label="Дата окончания" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} size="medium" InputLabelProps={{ shrink: true }} />
        <TextField label="Сумма" type="number" inputProps={{ min: '0', step: '0.01' }} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Напр. 100000" size="medium" />
        <TextField label="Процент, % годовых" type="number" inputProps={{ min: '0', step: '0.01' }} value={ratePercent} onChange={e => setRatePercent(e.target.value)} placeholder="Напр. 12" size="medium" />
      </div>
    </form>
  )
}


