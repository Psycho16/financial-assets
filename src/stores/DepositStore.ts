import { makeAutoObservable, toJS } from 'mobx'

export type Deposit = {
  id: string
  name: string
  endDate: string // ISO date string
  amount: number
  ratePercent: number
}

const STORAGE_KEY = 'deposits-store:v1'

export class DepositStore {
  items: Deposit[] = []

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  add(item: Omit<Deposit, 'id'>) {
    const rec: Deposit = { id: crypto.randomUUID(), ...item }
    this.items.push(rec)
    this.save()
  }

  update(id: string, changes: Partial<Omit<Deposit, 'id'>>) {
    const i = this.items.findIndex(x => x.id === id)
    if (i === -1) return
    this.items[i] = { ...this.items[i], ...changes }
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
          endDate: String(x.endDate ?? ''),
          amount: Number(x.amount ?? 0),
          ratePercent: Number(x.ratePercent ?? 0),
        }))
      }
    } catch {
      this.items = []
    }
  }
}

export const depositStore = new DepositStore()


