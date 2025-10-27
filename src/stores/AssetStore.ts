import { makeAutoObservable, computed, toJS } from 'mobx'

export type Asset = {
  id: string
  name: string
  amount: number
  category: string
}

type TotalsByCategory = Record<string, number>

const STORAGE_KEY = 'assets-store:v1'

export class AssetStore {
  assets: Asset[] = []

  constructor() {
    makeAutoObservable(this, {
      totalsByCategory: computed,
      totalAmount: computed,
    })
    this.loadFromStorage()
  }

  addAsset(asset: Omit<Asset, 'id'>) {
    const item: Asset = { id: crypto.randomUUID(), ...asset }
    this.assets.push(item)
    this.saveToStorage()
  }

  removeAsset(id: string) {
    this.assets = this.assets.filter(a => a.id !== id)
    this.saveToStorage()
  }

  clearAll() {
    this.assets = []
    this.saveToStorage()
  }

  get totalsByCategory(): TotalsByCategory {
    const totals: TotalsByCategory = {}
    for (const a of this.assets) {
      totals[a.category] = (totals[a.category] ?? 0) + a.amount
    }
    return totals
  }

  get totalAmount(): number {
    return this.assets.reduce((sum, a) => sum + a.amount, 0)
  }

  private saveToStorage() {
    try {
      const data = JSON.stringify(toJS(this.assets))
      localStorage.setItem(STORAGE_KEY, data)
    } catch {
      // ignore persistence errors
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Asset[]
      // Basic validation
      this.assets = Array.isArray(parsed)
        ? parsed
          .filter(x => x && typeof x === 'object')
          .map(x => ({
            id: String((x as any).id ?? crypto.randomUUID()),
            name: String((x as any).name ?? ''),
            amount: Number((x as any).amount ?? 0),
            category: String((x as any).category ?? 'Uncategorized'),
          }))
        : []
    } catch {
      this.assets = []
    }
  }
}

export const assetStore = new AssetStore()


