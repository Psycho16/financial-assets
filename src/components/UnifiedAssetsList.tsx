import { useState, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { unifiedAssetsStore, type DepositT, type ExchangeT, type UnifiedAsset, type UnifiedDepositAsset, type UnifiedExchangeAsset } from '../stores/UnifiedAssetsStore'
import { type Deposit } from '../stores/DepositStore'
import { exchangeStore, type ExchangeAsset } from '../stores/ExchangeStore'
import { moexStore } from '../stores/MoexStore'
import styles from './UnifiedAssetsList.module.scss'
import TextField from '@mui/material/TextField'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  TableSortLabel,
  useTheme,
  CircularProgress,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'
// import EditIcon from '@mui/icons-material/Edit'
import { formatNumber } from '../utils/numberFormat'
import { QuantityDialog } from './QuantityDialog'
import { DividendsModal } from './DividendsModal'

type EditingState = {
  [id: string]: {
    type: DepositT
    data: Partial<Deposit>
  } | {
    type: ExchangeT
    data: Partial<ExchangeAsset>
  }
}

type SortField = 'name' | 'value' | 'type' | 'sector' | 'quantity' | 'category' | 'price'
type SortDirection = 'asc' | 'desc'

type SortState = {
  field: SortField
  direction: SortDirection
}

export const UnifiedAssetsList = observer(function UnifiedAssetsList() {
  const theme = useTheme()
  const [editing, setEditing] = useState<EditingState>({})
  const [activeTicker, setactiveTicker] = useState<string | null>(null)

  const [quantityDialog, setQuantityDialog] = useState<{
    open: boolean
    asset: UnifiedExchangeAsset | null
    operation: 'add' | 'subtract'
  }>({
    open: false,
    asset: null,
    operation: 'add'
  })
  const [quantityDepositDialog, setQuantityDepositDialog] = useState<{
    open: boolean
    asset: UnifiedDepositAsset | null
    operation: 'add' | 'subtract'
  }>({
    open: false,
    asset: null,
    operation: 'add'
  })

  const [sortState, setSortState] = useState<SortState>({
    field: 'value',
    direction: 'desc'
  })


  // const startEdit = (asset: UnifiedAsset) => {
  //   if (asset.type === 'deposit') {
  //     const deposit = asset.data
  //     setEditing(prev => ({
  //       ...prev,
  //       [asset.id]: {
  //         type: 'deposit',
  //         data: {
  //           name: deposit.name,
  //           endDate: deposit.endDate,
  //           amount: deposit.amount,
  //           ratePercent: deposit.ratePercent,
  //         }
  //       }
  //     }))
  //   } else {
  //     const exchange = asset.data
  //     setEditing(prev => ({
  //       ...prev,
  //       [asset.id]: {
  //         type: 'exchange',
  //         data: {
  //           name: exchange.name,
  //           ticker: exchange.ticker ?? '',
  //           category: exchange.category,
  //           sector: exchange.sector,
  //           quantity: exchange.quantity,
  //         }
  //       }
  //     }))
  //   }
  // }

  const cancelEdit = (id: string) => {
    setEditing(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const saveEdit = (id: string) => {
    const editData = editing[id]
    if (!editData) return

    if (editData.type === 'deposit') {
      const data = editData.data
      const amt = Number(data.amount)
      const rate = Number(data.ratePercent)
      if (!Number.isFinite(amt) || amt <= 0 || !Number.isFinite(rate) || rate < 0) return

      unifiedAssetsStore.updateDeposit(id, {
        name: String(data.name ?? '').trim(),
        endDate: String(data.endDate ?? ''),
        amount: amt,
        ratePercent: rate,
      })
    } else {
      const data = editData.data
      const qty = Number(data.quantity)
      if (!Number.isFinite(qty) || qty <= 0) return

      unifiedAssetsStore.updateExchange(id, {
        name: String(data.name ?? '').trim(),
        ticker: String(data.ticker ?? '').trim() || undefined,
        category: String(data.category ?? 'Прочее').trim() || 'Прочее',
        sector: String(data.sector ?? 'Прочее').trim() || 'Прочее',
        quantity: qty,
      })
    }

    cancelEdit(id)
  }

  const openQuantityDialog = (asset: UnifiedExchangeAsset, operation: 'add' | 'subtract') => {
    setQuantityDialog({
      open: true,
      asset,
      operation
    })
  }

  const openQuantityDepositDialog = (asset: UnifiedDepositAsset, operation: 'add' | 'subtract') => {
    setQuantityDepositDialog({
      open: true,
      asset,
      operation
    })
  }

  const closeQuantityDepositDialog = () => {
    setQuantityDepositDialog({
      open: false,
      asset: null,
      operation: 'add'
    })
  }

  const closeQuantityDialog = () => {
    setQuantityDialog({
      open: false,
      asset: null,
      operation: 'add'
    })
  }

  const handleQuantityChange = (quantity: number) => {
    if (!quantityDialog.asset || quantityDialog.asset.type !== 'exchange') return

    const exchange = quantityDialog.asset.data
    const delta = quantityDialog.operation === 'add' ? quantity : -quantity
    const newQuantity = exchange.quantity + delta

    if (newQuantity >= 0) {
      unifiedAssetsStore.updateExchange(quantityDialog.asset.id, {
        quantity: newQuantity
      })
    }
  }

  const handleQuantityDepositChange = (quantity: number) => {
    if (!quantityDepositDialog.asset || quantityDepositDialog.asset.type !== 'deposit') return

    const deposit = quantityDepositDialog.asset.data
    const delta = quantityDepositDialog.operation === 'add' ? quantity : -quantity
    const newQuantity = deposit.amount + delta

    if (newQuantity >= 0) {
      unifiedAssetsStore.updateDeposit(quantityDepositDialog.asset.id, {
        amount: newQuantity
      })
    }
  }

  const getAssetValue = (asset: UnifiedAsset): number => {
    if (asset.type === 'deposit') {
      const deposit = asset.data
      return deposit.amount
    } else {
      const exchange = asset.data
      return exchange.totalPrice !== undefined ? exchange.totalPrice : 0
    }
  }

  const handleSort = (field: SortField) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedAssets = useMemo(() => {
    const assets = [...unifiedAssetsStore.allAssets]

    return assets.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortState.field) {
        case 'name':
          aValue = a.data.name.toLowerCase()
          bValue = b.data.name.toLowerCase()
          break
        case 'type':
          aValue = a.type === 'deposit' ? 0 : 1
          bValue = b.type === 'deposit' ? 0 : 1
          break
        case 'sector':
          if (a.type === 'deposit') {
            aValue = ''
          } else {
            aValue = a.data.sector.toLowerCase()
          }
          if (b.type === 'deposit') {
            bValue = ''
          } else {
            bValue = b.data.sector.toLowerCase()
          }
          break
        case 'category':
          if (a.type === 'deposit') {
            aValue = ''
          } else {
            aValue = a.data.category.toLowerCase()
          }
          if (b.type === 'deposit') {
            bValue = ''
          } else {
            bValue = b.data.category.toLowerCase()
          }
          break
        case 'quantity':
          if (a.type === 'deposit') {
            aValue = 0
          } else {
            aValue = a.data.quantity
          }
          if (b.type === 'deposit') {
            bValue = 0
          } else {
            bValue = b.data.quantity
          }
          break
        case 'price':
          if (a.type === 'deposit') {
            aValue = 0
          } else {
            aValue = a.data.price
          }
          if (b.type === 'deposit') {
            bValue = 0
          } else {
            bValue = b.data.price
          }
          break
        case 'value':
        default:
          aValue = getAssetValue(a)
          bValue = getAssetValue(b)
          break
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue)
        return sortState.direction === 'asc' ? result : -result
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = aValue - bValue
        return sortState.direction === 'asc' ? result : -result
      }
      return 0
    })
  }, [unifiedAssetsStore.allAssets, sortState, moexStore])

  const totalValue = unifiedAssetsStore.allAssets.reduce((sum, asset) => {
    return sum + getAssetValue(asset)
  }, 0)

  if (unifiedAssetsStore.allAssets.length === 0) {
    return <div className={styles.empty}>Нет активов</div>
  }

  return (
    <>
      {exchangeStore.isLoading ?
        <CircularProgress />
        :
        <TableContainer component={Paper} sx={{ maxHeight: 380 }}>
          <Table size="small" stickyHeader>
            <TableHead sx={{
              "th": {
                fontWeight: "bold",
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]
              }
            }}>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortState.field === 'type'}
                    direction={sortState.field === 'type' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('type')}
                  >
                    Тип
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortState.field === 'name'}
                    direction={sortState.field === 'name' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Название
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortState.field === 'category'}
                    direction={sortState.field === 'category' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('category')}
                  >
                    Категория
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortState.field === 'sector'}
                    direction={sortState.field === 'sector' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('sector')}
                  >
                    Отрасль
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  style={{ maxWidth: "120px" }}
                >
                  <TableSortLabel
                    active={sortState.field === 'quantity'}
                    direction={sortState.field === 'quantity' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('quantity')}
                  >
                    Количество
                  </TableSortLabel>
                </TableCell>
                <TableCell style={{ maxWidth: "100px" }}>
                  <TableSortLabel
                    active={sortState.field === 'price'}
                    direction={sortState.field === 'price' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('price')}
                  >
                    Цена за шт.
                  </TableSortLabel>
                </TableCell>
                <TableCell style={{ maxWidth: "100px" }}>
                  <TableSortLabel
                    active={sortState.field === 'value'}
                    direction={sortState.field === 'value' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('value')}
                  >
                    Стоимость
                  </TableSortLabel>
                </TableCell>
                <TableCell >Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAssets.map(asset => {
                const editData = editing[asset.id]
                const isEditing = Boolean(editData)
                const assetValue = getAssetValue(asset)

                if (isEditing) {
                  if (editData.type === 'deposit') {
                    return (
                      <TableRow key={`${asset.type}-${asset.id}`}>
                        <TableCell>
                          <div className={`${styles.typeBadge} ${styles.typeDeposit}`}>Вклад</div>
                        </TableCell>
                        <TableCell>
                          <TextField size="small" label="Название" value={String(editData.data.name ?? '')} onChange={ev => setEditing(s => ({ ...s, [asset.id]: { ...s[asset.id], data: { ...s[asset.id].data, name: ev.target.value } } }))} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" label="Дата окончания" type="date" value={String(editData.data.endDate ?? '')} onChange={ev => setEditing(s => ({ ...s, [asset.id]: { ...s[asset.id], data: { ...s[asset.id].data, endDate: ev.target.value } } }))} InputLabelProps={{ shrink: true }} />
                        </TableCell>
                        <TableCell >
                          <TextField size="small" label="Процент, %" type="number" value={String(editData.data.ratePercent ?? '')} onChange={ev => setEditing(s => ({ ...s, [asset.id]: { ...s[asset.id], data: { ...s[asset.id].data, ratePercent: Number(ev.target.value) } } }))} />
                        </TableCell>
                        <TableCell >
                          <TextField size="small" label="Сумма" type="number" value={String(editData.data.amount ?? '')} onChange={ev => setEditing(s => ({ ...s, [asset.id]: { ...s[asset.id], data: { ...s[asset.id].data, amount: Number(ev.target.value) } } }))} />
                        </TableCell>
                        <TableCell >
                          <div className={styles.actions}>
                            <button onClick={() => saveEdit(asset.id)} className={styles.save}>Сохранить</button>
                            <button onClick={() => cancelEdit(asset.id)} className={styles.cancel}>Отмена</button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }

                  return (
                    <TableRow key={`${asset.type}-${asset.id}`}>
                      <TableCell>
                        <div className={`${styles.typeBadge} ${styles.typeExchange}`}>Актив</div>
                      </TableCell>
                      <TableCell>
                        <TextField size="small" label="Название" value={String(editData.data.name ?? '')} onChange={ev => setEditing(s => ({ ...s, [asset.id]: { ...s[asset.id], data: { ...s[asset.id].data, name: ev.target.value } } }))} />
                      </TableCell>
                      <TableCell>
                        <TextField size="small" label="Категория" value={String(editData.data.category ?? '')} onChange={ev => setEditing(s => ({ ...s, [asset.id]: { ...s[asset.id], data: { ...s[asset.id].data, category: ev.target.value } } }))} />
                      </TableCell>
                      <TableCell>
                        <TextField size="small" label="Отрасль" value={String(editData.data.sector ?? '')} onChange={ev => setEditing(s => ({ ...s, [asset.id]: { ...s[asset.id], data: { ...s[asset.id].data, sector: ev.target.value } } }))} />
                      </TableCell>
                      <TableCell >
                        <TextField size="small" label="Количество" type="number" inputProps={{ min: '0', step: '1' }} value={String(editData.data.quantity ?? '')} onChange={ev => setEditing(s => ({ ...s, [asset.id]: { ...s[asset.id], data: { ...s[asset.id].data, quantity: Number(ev.target.value) } } }))} />
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell >
                        <div className={styles.actions}>
                          <button onClick={() => saveEdit(asset.id)} className={styles.save}>Сохранить</button>
                          <button onClick={() => cancelEdit(asset.id)} className={styles.cancel}>Отмена</button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                }

                // view mode
                return (
                  <TableRow key={`${asset.type}-${asset.id}`}
                  // style={asset.type === 'deposit' ? undefined : { cursor: "pointer" }}
                  // onClick={asset.type === 'deposit' ? undefined : () => setactiveTicker(asset?.data.ticker || null)}
                  >
                    <TableCell>
                      <div className={`${styles.typeBadge} ${asset.type === 'deposit' ? styles.typeDeposit : styles.typeExchange}`}>
                        {asset.type === 'deposit' ? 'Вклад' : 'Актив'}
                      </div>
                    </TableCell>
                    <TableCell className={styles.cellStrong}>
                      {asset.data.name}
                    </TableCell>
                    {asset.type === 'deposit' ? (
                      <>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell className={styles.cellMono} title={formatNumber(asset.data.amount)}>{formatNumber(asset.data.amount)} р</TableCell>
                        <TableCell >
                          <div className={styles.actions}>
                            <IconButton
                              aria-label="add"
                              onClick={(e) => {
                                e.stopPropagation()
                                openQuantityDepositDialog(asset, 'add')
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                openQuantityDepositDialog(asset, 'subtract')
                              }}>
                              <RemoveIcon />
                            </IconButton>
                            {/* <IconButton aria-label="edit" onClick={() => startEdit(asset)}>
                              <EditIcon />
                            </IconButton> */}
                            <IconButton
                              aria-label="delete"
                              onClick={() => unifiedAssetsStore.removeAsset(asset.id, asset.type)}>
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{asset.data.category}</TableCell>
                        <TableCell>{asset.data.sector}</TableCell>
                        <TableCell
                          className={styles.cellMono}
                          style={{ maxWidth: "120px" }}
                          title={`${formatNumber(asset.data.quantity, { fractionDigits: 0 })} шт.`}
                        >
                          {formatNumber(asset.data.quantity, { fractionDigits: 0 })} шт.
                        </TableCell>
                        <TableCell
                          style={{ maxWidth: "100px" }}
                          className={styles.cellMono}
                          title={`${asset.data.price !== undefined ? `${formatNumber(asset.data.price)} р` : '-'}`}
                        >
                          {`${asset.data.price !== undefined ? `${formatNumber(asset.data.price)} р` : '-'}`}
                        </TableCell>
                        <TableCell
                          className={styles.cellMono}
                          style={{ maxWidth: "100px" }}
                          title={`${formatNumber(assetValue)} р`}
                        >
                          {formatNumber(assetValue)} р
                        </TableCell>
                        <TableCell>
                          <div className={styles.actions}>
                            <IconButton
                              aria-label="add"
                              onClick={(e) => {
                                e.stopPropagation()
                                openQuantityDialog(asset, 'add')
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                openQuantityDialog(asset, 'subtract')
                              }}>
                              <RemoveIcon />
                            </IconButton>
                            {/* <IconButton aria-label="edit" onClick={(e) => {
                              e.stopPropagation()
                              startEdit(asset)
                            }}>
                              <EditIcon />
                            </IconButton> */}
                            <IconButton
                              aria-label="delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                unifiedAssetsStore.removeAsset(asset.id, asset.type)
                              }}>
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter sx={{
              left: 0,
              bottom: 0, // <-- KEY
              zIndex: 2,
              position: "sticky",
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],

              "td": {
                fontWeight: "bold",
                color: theme.palette.text.primary
              }
            }}>
              <TableRow>
                <TableCell />
                <TableCell colSpan={5}>Итого</TableCell>
                <TableCell align="right" className={styles.cellMono}>{formatNumber(totalValue)}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      }

      {quantityDialog.asset && (
        <QuantityDialog
          open={quantityDialog.open}
          onClose={closeQuantityDialog}
          onConfirm={handleQuantityChange}
          type={quantityDialog.asset.type}
          assetName={quantityDialog.asset.data.name}
          currentQuantity={quantityDialog.asset.data.quantity}
          operation={quantityDialog.operation}
        />
      )}

      {quantityDepositDialog.asset && (
        <QuantityDialog
          open={quantityDepositDialog.open}
          onClose={closeQuantityDepositDialog}
          onConfirm={handleQuantityDepositChange}
          type={quantityDepositDialog.asset.type}
          assetName={quantityDepositDialog.asset.data.name}
          currentQuantity={quantityDepositDialog.asset.data.amount}
          operation={quantityDepositDialog.operation}
        />
      )}

      <DividendsModal
        onClose={() => setactiveTicker(null)}
        open={!!activeTicker}
        ticker={activeTicker}
      />
    </>
  )
})
