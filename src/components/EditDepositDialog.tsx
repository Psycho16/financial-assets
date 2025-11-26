import { useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
import type { Deposit } from "../stores/DepositStore"

interface EditDepositDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (changes: Pick<Deposit, 'name' | 'endDate' | 'ratePercent'>) => void
  deposit: Deposit
}
export const EditDepositDialog = ({
  open,
  deposit,
  onClose,
  onConfirm,
}: EditDepositDialogProps) => {
  const [name, setName] = useState(deposit.name)
  const [endDate, setEndDate] = useState(deposit.endDate)
  const [ratePercent, setRatePercent] = useState(deposit.ratePercent)

  const handleConfirm = () => {
    onConfirm({
      name,
      endDate,
      ratePercent
    })
    onClose()
  }

  const initialDataIsSame = deposit.name === name && deposit.endDate === endDate && deposit.ratePercent === ratePercent

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать <strong>{deposit.name}</strong></DialogTitle>
      <DialogContent>
        <Stack rowGap={"16px"}>
          <Stack flexDirection={"row"} columnGap={"10px"}>
            <TextField
              autoFocus
              margin="dense"
              label={"Название"}
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              
            />
            <TextField
              margin="dense"
              label={"Дата окончания"}
              fullWidth
              variant="outlined"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Stack>
          <TextField
            margin="dense"
            label={"Процент годовых"}
            multiline
            fullWidth
            variant="outlined"
            value={ratePercent}
            onChange={(e) => setRatePercent(Number(e.target.value))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={initialDataIsSame}
        >
          {"Изменить"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}