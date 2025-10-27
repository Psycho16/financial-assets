import { type FormEvent, useState } from 'react'
import TextField from '@mui/material/TextField'
import { exchangeStore } from '../stores/ExchangeStore'
import styles from './ExchangeAssetForm.module.scss'

export function ExchangeAssetForm({ onCloseModal }: { onCloseModal: () => void }) {
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [category, setCategory] = useState('')
  const [sector, setSector] = useState('')
  const [quantity, setQuantity] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const qty = Number(quantity)
    if (!name.trim() || !Number.isFinite(qty) || qty <= 0) return
    exchangeStore.add({
      name: name.trim(),
      ticker: ticker.trim() || undefined,
      category: category.trim() || 'Прочее',
      sector: sector.trim() || 'Прочее',
      quantity: qty,
    })
    setName('')
    setTicker('')
    setCategory('')
    setSector('')
    setQuantity('')
    onCloseModal()
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>Добавить биржевой актив</button>
      </div>
      <div className={styles.row}>
        <TextField label="Название" value={name} onChange={e => setName(e.target.value)} placeholder="Напр. Сбербанк" size="medium" fullWidth />
        <TextField label="Тикер" value={ticker} onChange={e => setTicker(e.target.value)} placeholder="Напр. SBER" size="medium" />
        <TextField label="Категория" value={category} onChange={e => setCategory(e.target.value)} placeholder="Напр. Акции" size="medium" />
        <TextField label="Отрасль" value={sector} onChange={e => setSector(e.target.value)} placeholder="Напр. Финансы" size="medium" />
        <TextField label="Количество паев/бумаг" type="number" inputProps={{ min: '0', step: '1' }} value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Напр. 10" size="medium" />
      </div>
    </form>
  )
}



