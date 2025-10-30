import { type FormEvent, useState } from 'react'
import TextField from '@mui/material/TextField'
import { exchangeStore } from '../stores/ExchangeStore'
import styles from './ExchangeAssetForm.module.scss'
import { Autocomplete, Box, CircularProgress } from '@mui/material'
import { debounce } from '../utils/debounce'
import type { TickerOption } from '../types/asset'
import { axiosClient, PATHS } from '../utils/axios'

const splitSymbol = '%'
type Option = { name: string, boardName: string }

export function ExchangeAssetForm({ onCloseModal }: { onCloseModal: () => void }) {
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [category, setCategory] = useState('')
  const [sector, setSector] = useState('')
  const [quantity, setQuantity] = useState('')
  const [boardName, setBoardName] = useState('')

  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async (ticker: string) => {
    if (!ticker) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const resp = await axiosClient.get<{ tickerOptions: TickerOption[] }>(PATHS.ACCEPTED_ASSETS, { params: { search: ticker } })

      const tickerOptions: Option[] = resp.data.tickerOptions.map((item: TickerOption) => ({
        name: `${item.name}${splitSymbol}${item.ticker}`,
        boardName: item.boardName,
      }))

      setOptions(tickerOptions ?? []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchOptions = debounce(fetchOptions, 500)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const qty = Number(quantity)
    if (!name.trim() || !Number.isFinite(qty) || qty <= 0) return

    const newAsset = {
      name: name.trim(),
      ticker: ticker.trim() || undefined,
      category: category.trim() || 'Прочее',
      sector: sector.trim() || 'Прочее',
      quantity: qty,
      boardName: boardName.trim() || undefined,
    }

    exchangeStore.add(newAsset)
    setName('')
    setTicker('')
    setCategory('')
    setSector('')
    setQuantity('')
    setBoardName('')
    onCloseModal()
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>Добавить биржевой актив</button>
      </div>
      <div className={styles.row}>
        <Autocomplete
          options={options}
          loading={loading}
          onInputChange={(_, newInputValue) => {
            debouncedFetchOptions(newInputValue)
          }}
          onChange={(e, value) => {
            const splittedValue = value?.name?.split(splitSymbol) ?? []
            const name = splittedValue[0]
            const ticker = splittedValue[1]
            const boardName = value?.boardName
            if (name) {
              setName(name)
            }
            if (ticker) {
              setTicker(ticker);
            }

            if (boardName) {
              setBoardName(boardName)
            }
          }}
          getOptionLabel={(option) => {
            const splittedValue = option.name?.split(splitSymbol) ?? []
            const name = splittedValue[0]
            const ticker = splittedValue[1]

            return `${ticker} ${name}`
          }}
          renderOption={(props, option) => {
            const splittedValue = option.name?.split(splitSymbol) ?? []
            const name = splittedValue[0]
            const ticker = splittedValue[1]
            return (
              <Box
                component={"li"}
                {...props}
                key={option.name}
                display={"flex"}
                columnGap={"5px"}
              >
                <div>{ticker}</div>
                <div>{name}</div>
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Тикер/Название"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <TextField label="Категория" value={category} onChange={e => setCategory(e.target.value)} placeholder="Напр. Акции" size="medium" />
        <TextField label="Отрасль" value={sector} onChange={e => setSector(e.target.value)} placeholder="Напр. Финансы" size="medium" />
        <TextField label="Количество паев/бумаг" type="number" inputProps={{ min: '0', step: '1' }} value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Напр. 10" size="medium" />
      </div>
    </form>
  )
}



