import { makeAutoObservable, runInAction } from 'mobx'
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

export class ExchangeStore {
  items: ExchangeAsset[] = []
  isLoading = false

  constructor() {
    makeAutoObservable(this)
    this.loadAssets()
  }

  async add(item: Pick<ExchangeAsset, "name" | "ticker" | "category" | "sector" | "quantity" | "boardName">) {
    const userId = localStorage.getItem(USER_ID_KEY)

    await axiosClient.post(PATHS.USER_ASSETS.ADD, {
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

  async remove(id: string) {
    await axiosClient.delete(PATHS.USER_ASSETS.DELETE, {
      params: {
        assetId: id,
      }
    })

    await this.loadAssets()
  }

  private async loadAssets() {
    runInAction(() => {
      this.isLoading = true
    })
    try {
      const userId = localStorage.getItem(USER_ID_KEY)
      const resp = await axiosClient.get<{ userAssets: ExchangeAsset[] }>(PATHS.USER_ASSETS.GET, { params: { userId } })
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
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }
}

export const exchangeStore = new ExchangeStore()



