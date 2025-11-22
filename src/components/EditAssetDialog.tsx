import { useState } from "react"
import { exchangeStore, type ExchangeAsset } from "../stores/ExchangeStore"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
import { observer } from "mobx-react-lite"

interface EditAssetDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (changes: Pick<ExchangeAsset, 'category' | 'sector' | 'comment'>) => void
  asset: ExchangeAsset
}
export const EditAssetDialog = observer(function EditAssetDialog({
  open,
  asset,
  onClose,
  onConfirm,
}: EditAssetDialogProps) {
  const [sector, setSector] = useState(asset.sector)
  const [comment, setComment] = useState(asset.comment)
  const [category, setCategory] = useState(asset.category)

  const handleConfirm = () => {
    onConfirm({
      sector,
      comment,
      category
    })
    onClose()
  }


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать <strong>{asset.name}</strong></DialogTitle>
      <DialogContent>
        <Stack rowGap={"16px"}>
          <Stack flexDirection={"row"} columnGap={"10px"}>
            <TextField
              autoFocus
              margin="dense"
              label={"Отрасль"}
              fullWidth
              variant="outlined"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
            <TextField
              margin="dense"
              label={"Категория"}
              fullWidth
              variant="outlined"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Stack>
          <TextField
            margin="dense"
            label={"Комментарий"}
            multiline
            fullWidth
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={exchangeStore.isUpdateLoading}
        >
          {"Изменить"}
        </Button>
      </DialogActions>
    </Dialog>
  )
})