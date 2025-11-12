import { makeAutoObservable, runInAction, toJS } from 'mobx'
import { USER_ID_KEY } from '../constants/localStorage'
import { axiosClient, PATHS } from '../utils/axios'

export type ExchangeAsset = {
  id: string
  name: string
  amount: number
  category: string
  price: number
  totalPrice: number
  changePercent: number
  boardName: string
  quantity: number
  sector: string
  ticker: string
}

const STORAGE_KEY = 'exchange-assets-store:v1'

export class ExchangeStore {
  items: ExchangeAsset[] = []

  constructor() {
    makeAutoObservable(this)
    this.loadAssets()
  }

  async add(item: Pick<ExchangeAsset, "name" | "ticker" | "category" | "sector" | "quantity" | "boardName">) {
    const userId = localStorage.getItem(USER_ID_KEY)

    await axiosClient.post(PATHS.USERS.ADD_ASSET, {
      userId,
      ...item
    })

    await this.loadAssets()

  }

  async update(id: string, changes: Partial<Omit<ExchangeAsset, 'id'>>) {
    await axiosClient.patch(PATHS.USER_ASSETS.EDIT_QUANTITY, {
      assetId: id,
      quantity: changes.quantity,
    })

    await this.loadAssets()
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

  private async loadAssets() {
    try {
      const userId = localStorage.getItem(USER_ID_KEY)
      const resp = await axiosClient.get<{ userAssets: ExchangeAsset[] }>(PATHS.USER_ASSETS.GET_ASSETS, { params: { userId } })
      const userAssets = resp?.data?.userAssets

      if (!userAssets) return
      // Basic validation
      runInAction(() => {
        this.items = Array.isArray(userAssets)
          ? userAssets
          : []
      })
    } catch {
      runInAction(() => {
        this.items = []
      })
    }
  }
}

export const exchangeStore = new ExchangeStore()



