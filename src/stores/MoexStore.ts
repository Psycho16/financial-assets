import { makeAutoObservable, runInAction } from 'mobx'
import { getMoexBoardLink } from '../utils/getMoexBoardLink'
import { ACCEPTED_BOARDS } from '../constants/boards'

type Ticker = string

export class MoexStore {
  prices: Map<Ticker, number> = new Map()
  changePercents: Map<Ticker, number> = new Map()
  loading: Set<Ticker> = new Set()
  errors: Map<Ticker, string> = new Map()

  constructor() {
    makeAutoObservable(this)
  }

  getPrice(ticker?: string): number | undefined {
    if (!ticker) return undefined
    return this.prices.get(ticker.toUpperCase())
  }

  getChangePercent(ticker?: string): number | undefined {
    if (!ticker) return undefined
    return this.changePercents.get(ticker.toUpperCase())
  }

  async fetchPrice(ticker?: string) {
    const secid = ticker?.trim().toUpperCase()
    if (!secid || this.loading.has(secid)) return
    this.loading.add(secid)
    this.errors.delete(secid)

    const boards = ACCEPTED_BOARDS.map(boardName => ({
      name: boardName,
      url: getMoexBoardLink(secid, boardName),
    }))

    for (const board of boards) {
      try {
        const res = await fetch(board.url)
        if (!res.ok) continue
        const data = await res.json() as any
        const columns: string[] = data?.marketdata?.columns ?? []
        const dataRows: any[] = data?.marketdata?.data ?? []
        const marketPriceIdx = columns.indexOf('MARKETPRICE')
        const lastPriceIdx = columns.indexOf('LAST')
        const lastToPrevPriceIdx = columns.indexOf('LASTTOPREVPRICE')
        const row = Array.isArray(dataRows) && dataRows.length > 0 ? dataRows[0] : undefined

        const marketPrice = marketPriceIdx !== -1 && row ? Number(row[marketPriceIdx]) : NaN
        const last = lastPriceIdx !== -1 && row && Number(row[lastPriceIdx]) > 0 ? Number(row[lastPriceIdx]) : marketPrice
        const prcnt = (lastToPrevPriceIdx !== -1 && row ? Number(row[lastToPrevPriceIdx]) : NaN) ?? 0

        if (Number.isFinite(last)) {
          runInAction(() => {
            this.prices.set(secid, last)
            if (Number.isFinite(prcnt)) {
              this.changePercents.set(secid, prcnt)
            }
          })
          return
        }
      } catch {
        // Continue to next board
        continue
      } finally {
        this.loading.delete(secid)
      }
    }

    // If no board worked
    runInAction(() => {
      this.errors.set(secid, 'PRICE_NOT_FOUND')
    })
  }

  // Keep old method name for backward compatibility
  async fetchSharePrice(ticker?: string) {
    return this.fetchPrice(ticker)
  }
}

export const moexStore = new MoexStore()


