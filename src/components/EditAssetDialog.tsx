import { useState } from "react"
import { type ExchangeAsset } from "../stores/ExchangeStore"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"

interface EditAssetDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (changes: Pick<ExchangeAsset, 'category' | 'sector' | 'comment'>) => void
  asset: ExchangeAsset
}
export const EditAssetDialog = ({
  open,
  asset,
  onClose,
  onConfirm,
}: EditAssetDialogProps) => {
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

  const initialDataIsSame = asset.sector === sector && asset.comment === comment && asset.category === category

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
          disabled={initialDataIsSame}
        >
          {"Изменить"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}