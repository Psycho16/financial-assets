import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography
} from '@mui/material'
import type { DepositT, ExchangeT } from '../stores/UnifiedAssetsStore'

interface QuantityDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (quantity: number) => void
  type: ExchangeT | DepositT
  assetName: string
  currentQuantity: number
  operation: 'add' | 'subtract'
}

export const QuantityDialog = ({
  open,
  type,
  onClose,
  onConfirm,
  assetName,
  currentQuantity,
  operation
}: QuantityDialogProps) => {
  const [quantity, setQuantity] = useState("0")

  const handleConfirm = () => {
    const quantityForSave = Number(quantity)
    if (Number.isNaN(quantityForSave) || quantityForSave <= 0) return;

    onConfirm(quantityForSave)
    setQuantity("")
    onClose()
  }

  const handleClose = () => {
    setQuantity("")
    onClose()
  }

  const getLabelByType = () => {
    if (type === "deposit") {
      const operationText = operation === 'add' ? 'прибавления' : 'вычитания'
      return `Количество рублей для ${operationText}`
    }
    const operationText = operation === 'add' ? 'добавления' : 'продажи'

    return `Количество паев для ${operationText}`
  }

  const getButtonTextByType = () => {
    if (type === "deposit") {
      return operation === 'add' ? "Прибавить" : "Вычесть"
    }

    return operation === 'add' ? 'Добавить' : 'Убавить'
  }

  const getDialogTitleByType = () => {
    if (type === "deposit") {
      return operation === 'add' ? "Прибавить сумму" : "Вычесть сумму"
    }

    return operation === 'add' ? 'Добавить паи' : 'Продать паи'
  }

  const countType = type === "deposit" ? "р." : "шт."

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {getDialogTitleByType()}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Актив: <strong>{assetName}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Текущее количество: <strong>{currentQuantity}</strong> {countType}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label={getLabelByType()}
          fullWidth
          variant="outlined"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={Number.isNaN(Number(quantity)) || Number(quantity) <= 0 || (operation === 'subtract' && Number(quantity) > currentQuantity)}
        >
          {getButtonTextByType()}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
