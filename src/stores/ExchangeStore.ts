import { makeAutoObservable, toJS } from 'mobx'

export type ExchangeAsset = {
  id: string
  name: string
  ticker?: string
  category: string
  sector: string
  quantity: number
  boardName?: string
}

const STORAGE_KEY = 'exchange-assets-store:v1'

export class ExchangeStore {
  items: ExchangeAsset[] = []

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  add(item: Omit<ExchangeAsset, 'id'>) {
    const record: ExchangeAsset = { id: crypto.randomUUID(), ...item }
    this.items.push(record)
    this.save()
  }

  update(id: string, changes: Partial<Omit<ExchangeAsset, 'id'>>) {
    const idx = this.items.findIndex(x => x.id === id)
    if (idx === -1) return
    this.items[idx] = { ...this.items[idx], ...changes }
    this.save()
  }

  remove(id: string) {
    this.items = this.items.filter(x => x.id !== id)
    this.save()
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toJS(this.items)))
    } catch { }
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) {
        this.items = arr.map((x: any) => ({
          id: String(x.id ?? crypto.randomUUID()),
          name: String(x.name ?? ''),
          ticker: x.ticker ? String(x.ticker) : undefined,
          category: String(x.category ?? 'Прочее'),
          sector: String(x.sector ?? 'Прочее'),
          quantity: Number(x.quantity ?? 0),
          boardName: x.boardName ? String(x.boardName) : undefined,
        }))
      }
    } catch {
      this.items = []
    }
  }
}

export const exchangeStore = new ExchangeStore()



