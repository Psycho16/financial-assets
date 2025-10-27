import { useEffect, useState } from 'react'
import { CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { observer } from 'mobx-react-lite'
import CloseIcon from '@mui/icons-material/Close'
import { tInvestmentsStore } from '../stores/TInvestmentsStore'
import { ACCEPTED_BOARDS } from '../constants/boards'

interface DividendsModalProps {
  open: boolean
  onClose: () => void
  ticker: string | null
}

type CurrencyObject = {
  currency: string,
  units: string | number,
  nano: number
};
const convertCurrencyToNumber = (currencyObj: CurrencyObject): number => {
  const { units, nano } = currencyObj;
  // Преобразуем целое значение в число (если оно строка)
  const wholePart = Number(units);
  // Получаем дробную часть путём деления на миллиард
  const fractionalPart = nano / 1_000_000_000;
  return wholePart + fractionalPart;
}

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-')
  const dayWithoutTimeZone = day.slice(0, 2)

  return `${dayWithoutTimeZone}.${month}.${year}`
}

export const DividendsModal = observer(function DividendsModal({ ticker, open, onClose }: DividendsModalProps) {
  const [dividendsData, setDividendsData] = useState<{ lastBuyDate: string, value: number }[]>([])
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const getDividendsHistory = async (ticker: string) => {
    setIsLoading(true)
    const instruments = await tInvestmentsStore.fetchInstrument(ticker)

    const currentInstrument: {
      uid: string,
      name: string,
      ticker: string,
      classCode: string,
      instrumentType: string
    } = instruments.find((item: Record<string, unknown>) => {
      return (item.ticker === ticker && ACCEPTED_BOARDS.some(board => board === item.classCode))
    })

    setName(currentInstrument.name)

    const dividends = await tInvestmentsStore.fetchDividends(currentInstrument.uid)

    const dividendsList = dividends.map((divItem: { dividendNet: CurrencyObject, lastBuyDate: string }) => ({
      lastBuyDate: formatDate(divItem.lastBuyDate),
      value: convertCurrencyToNumber(divItem.dividendNet)
    }))

    setDividendsData(dividendsList)
    setIsLoading(false)
  }

  useEffect(() => {
    if (!ticker) return
    getDividendsHistory(ticker)
  }, [ticker])

  return (
    <Dialog
      open={open}
      onClose={() => {
        setName("")
        onClose()
      }
      } maxWidth="sm" fullWidth>
      <DialogTitle>
        <div>
          Дивидендные отсечки по бумаге <>
            {isLoading ? <CircularProgress size={15} /> : name}
          </>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent >
        <div style={{ height: '100px' }}>

          {isLoading ? <CircularProgress /> :
            dividendsData.map((dividend) => {
              return (
                <div key={dividend.lastBuyDate} style={{ display: "flex", columnGap: "50px" }}>
                  {/* <div>{dividend.ticker}</div> */}
                  <div>{dividend.lastBuyDate}</div>
                  <div>{dividend.value} р</div>
                </div>
              )
            })}
        </div>
      </DialogContent>
    </Dialog>
  )
})