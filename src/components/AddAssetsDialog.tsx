import { Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import { ExchangeAssetForm } from "./ExchangeAssetForm";
import { DepositForm } from "./DepositForm";

export interface AddAssetsDialogProps {
  open: boolean;
  onClose: () => void;
}
export function AddAssetsDialog(props: AddAssetsDialogProps) {
  const { onClose, open } = props;
  const [activeFormId, setActiveFormId] = useState<string>("");

  const handleChange = (event: SelectChangeEvent) => {
    setActiveFormId(event.target.value);
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Добавление активов</DialogTitle>
      <DialogContent sx={{
        minHeight: "70vh"
      }}>
        <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-filled-label">Тип актива</InputLabel>
          <Select
            value={activeFormId}
            label="Тип актива"
            onChange={handleChange}
          >
            <MenuItem value={"deposit"}>Вклад</MenuItem>
            <MenuItem value={"shares"}>Биржевой актив</MenuItem>
          </Select>
        </FormControl>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {activeFormId === "shares" && <ExchangeAssetForm onCloseModal={onClose} />}
          {activeFormId === "deposit" && <DepositForm onCloseModal={onClose} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}