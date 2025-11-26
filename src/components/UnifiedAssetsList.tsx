import { useState, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { unifiedAssetsStore, type UnifiedAsset, type UnifiedDepositAsset, type UnifiedExchangeAsset } from '../stores/UnifiedAssetsStore'
import { exchangeStore, type ExchangeAsset } from '../stores/ExchangeStore'
import styles from './UnifiedAssetsList.module.scss'
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
import EditIcon from '@mui/icons-material/Edit'
import { formatNumber } from '../utils/numberFormat'
import { QuantityDialog } from './QuantityDialog'
import { EditAssetDialog } from './EditAssetDialog'
import { depositStore, type Deposit } from '../stores/DepositStore'
import { EditDepositDialog } from './EditDepositDialog'

type SortField = 'name' | 'value' | 'type' | 'sector' | 'quantity' | 'category' | 'price'
type SortDirection = 'asc' | 'desc'

type SortState = {
  field: SortField
  direction: SortDirection
}

export const UnifiedAssetsList = observer(function UnifiedAssetsList() {
  const theme = useTheme()

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
    deposit: UnifiedDepositAsset | null
    operation: 'add' | 'subtract'
  }>({
    open: false,
    deposit: null,
    operation: 'add'
  })

  const [editAssetDialog, setEditAssetDialog] = useState<{
    open: boolean
    asset: ExchangeAsset | null
  }>({
    open: true,
    asset: null,
  })

   const [editDepositDialog, setEditDepositDialog] = useState<{
    open: boolean
    deposit: Deposit | null
  }>({
    open: true,
    deposit: null,
  })

  const [sortState, setSortState] = useState<SortState>({
    field: 'value',
    direction: 'desc'
  })

  const openEditAssetDialog = (asset: ExchangeAsset) => {
    setEditAssetDialog({
      open: true,
      asset,
    })
  }

  const openEditDepositDialog = (deposit: Deposit) => {
    setEditDepositDialog({
      open: true,
      deposit,
    })
  }

  const openQuantityDialog = (asset: UnifiedExchangeAsset, operation: 'add' | 'subtract') => {
    setQuantityDialog({
      open: true,
      asset,
      operation
    })
  }

  const openQuantityDepositDialog = (deposit: UnifiedDepositAsset, operation: 'add' | 'subtract') => {
    setQuantityDepositDialog({
      open: true,
      deposit,
      operation
    })
  }

  const closeEditAssetDialog = () => {
    setEditAssetDialog({
      open: false,
      asset: null,
    })
  }

  const closeEditDepositDialog = () => {
    setEditDepositDialog({
      open: false,
      deposit: null,
    })
  }

  const closeQuantityDepositDialog = () => {
    setQuantityDepositDialog({
      open: false,
      deposit: null,
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
      unifiedAssetsStore.updateExchangeQuantity(quantityDialog.asset.id, newQuantity)
    }
  }

  const handleQuantityDepositChange = (quantity: number) => {
    if (!quantityDepositDialog.deposit || quantityDepositDialog.deposit.type !== 'deposit') return

    const deposit = quantityDepositDialog.deposit.data
    const delta = quantityDepositDialog.operation === 'add' ? quantity : -quantity
    const newQuantity = deposit.amount + delta

    if (newQuantity >= 0) {
      unifiedAssetsStore.updateDepositAmount(quantityDepositDialog.deposit.id, {
        amount: newQuantity
      })
    }
  }

  const handleAssetChange = (changes: Pick<ExchangeAsset, "sector" | "category" | "comment">) => {
    if (!editAssetDialog?.asset?.id) return

    unifiedAssetsStore.updateExchange(editAssetDialog.asset.id, changes)
  }

  const handleDepositChange = (changes: Pick<Deposit, 'name' | 'endDate' | 'ratePercent'>) => {
     if (!editDepositDialog?.deposit?.id) return

    unifiedAssetsStore.updateDeposit(editDepositDialog.deposit.id, changes)
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
  }, [unifiedAssetsStore.allAssets, sortState])

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
                const assetValue = getAssetValue(asset)
                return (
                  <TableRow key={`${asset.type}-${asset.id}`}>
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
                          {depositStore.updatingDepositList.has(asset.id) ? 
                          <CircularProgress/>
                          :
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
                            <IconButton aria-label="edit" onClick={() => openEditDepositDialog(asset.data)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => unifiedAssetsStore.removeAsset(asset.id, asset.type)}>
                              <DeleteIcon />
                            </IconButton>
                          </div>}
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
                          {exchangeStore.updatingAssetList.has(asset.id) ?
                            <CircularProgress />
                            :
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
                              <IconButton aria-label="edit" onClick={(e) => {
                                e.stopPropagation()
                                openEditAssetDialog(asset.data)
                              }}>
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  unifiedAssetsStore.removeAsset(asset.id, asset.type)
                                }}>
                                <DeleteIcon />
                              </IconButton>
                            </div>
                          }
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

      {quantityDepositDialog.deposit && (
        <QuantityDialog
          open={quantityDepositDialog.open}
          onClose={closeQuantityDepositDialog}
          onConfirm={handleQuantityDepositChange}
          type={quantityDepositDialog.deposit.type}
          assetName={quantityDepositDialog.deposit.data.name}
          currentQuantity={quantityDepositDialog.deposit.data.amount}
          operation={quantityDepositDialog.operation}
        />
      )}

      {editAssetDialog.asset && (
        <EditAssetDialog
          open={editAssetDialog.open}
          onClose={closeEditAssetDialog}
          onConfirm={handleAssetChange}
          asset={editAssetDialog.asset}
        />
      )}

        {editDepositDialog.deposit && (
        <EditDepositDialog
          open={editDepositDialog.open}
          onClose={closeEditDepositDialog}
          onConfirm={handleDepositChange}
          deposit={editDepositDialog.deposit}
        />
      )}
    </>
  )
})
