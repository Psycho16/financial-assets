import { type FormEvent, useState } from 'react'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { assetStore } from '../stores/AssetStore'
import styles from './AssetForm.module.scss'

const DEFAULT_CATEGORIES = ['Крипто', 'Акции', 'Облигации', 'Недвижимость', 'Наличные']

export function AssetForm() {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!name.trim() || !Number.isFinite(parsed) || parsed <= 0) return
    assetStore.addAsset({ name: name.trim(), amount: parsed, category })
    setName('')
    setAmount('')
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. BTC" size="medium" />
        <TextField label="Сумма" type="number" inputProps={{ step: '0.01', min: '0' }} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Напр. 1000" size="medium" />
        <TextField label="Категория" select value={category} onChange={(e) => setCategory(e.target.value)} size="medium">
          {DEFAULT_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>Добавить актив</button>
      </div>
    </form>
  )
}


