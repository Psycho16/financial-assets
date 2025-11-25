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
  comment: string
}

type UpdatedAsset = Omit<ExchangeAsset, "totalPrice" | "changePercent" | "price">

const recalculateTotalPrice = (price: number, quantity: number) => {
  return price * quantity
}

const isResponseSuccess = (statusCode: number) => statusCode === 200

export class ExchangeStore {
  items: ExchangeAsset[] = []
  isLoading = false
  updatingAssetList = new Set()

  constructor() {
    makeAutoObservable(this)
    this.loadAssets()
  }

  async add(item: Pick<ExchangeAsset, "name" | "ticker" | "category" | "sector" | "quantity" | "boardName" | "comment">) {
    const userId = localStorage.getItem(USER_ID_KEY)
    runInAction(() => {
      this.isLoading = true
    })
    await axiosClient.post(PATHS.USER_ASSETS.ADD, {
      userId,
      ...item
    })

    runInAction(() => {
      this.isLoading = false
    })

    await this.loadAssets()
  }

  async updateAssetQuantity(id: string, quantity: ExchangeAsset['quantity']) {
    runInAction(() => {
      this.updatingAssetList.add(id)
      this.updatingAssetList = this.updatingAssetList
    })
    const resp = await axiosClient.patch<UpdatedAsset>(PATHS.USER_ASSETS.EDIT_QUANTITY, {
      assetId: id,
      quantity,
    })

    const updatedAsset = resp.data
    const isSuccess = isResponseSuccess(resp.status)

    if (!!updatedAsset && isSuccess) {
      runInAction(() => {
        this.items = this.items.map<ExchangeAsset>((item) => {
          if (item.id === updatedAsset.id) {
            return {
              ...updatedAsset,
              changePercent: item.changePercent,
              price: item.price,
              totalPrice: recalculateTotalPrice(item.price, updatedAsset.quantity)
            }
          }

          return {
            ...item
          }
        })
      })
    }

    runInAction(() => {
      this.updatingAssetList.delete(id)
      this.updatingAssetList = this.updatingAssetList
    })

  }

  async updateAsset(id: string, changes: Pick<ExchangeAsset, 'category' | 'sector' | 'comment'>) {
    runInAction(() => {
      this.updatingAssetList.add(id)
      this.updatingAssetList = this.updatingAssetList
    })

    const resp = await axiosClient.patch<UpdatedAsset>(PATHS.USER_ASSETS.EDIT_ASSET, {
      assetId: id,
      category: changes.category,
      sector: changes.sector,
      comment: changes.comment,
    })

    const updatedAsset = resp.data
    const isSuccess = isResponseSuccess(resp.status)

    if (!!updatedAsset && isSuccess) {
      runInAction(() => {
        this.items = this.items.map<ExchangeAsset>((item) => {
          if (item.id === updatedAsset.id) {
            return {
              ...updatedAsset,
              changePercent: item.changePercent,
              price: item.price,
              totalPrice: item.totalPrice
            }
          }

          return {
            ...item
          }
        })
      })
    }

    runInAction(() => {
      this.updatingAssetList.delete(id)
      this.updatingAssetList = this.updatingAssetList
    })

  }

  async remove(id: string) {
    runInAction(() => {
      this.updatingAssetList.add(id)
      this.updatingAssetList = this.updatingAssetList
    })

    const resp = await axiosClient.delete(PATHS.USER_ASSETS.DELETE, {
      params: {
        assetId: id,
      }
    })

    const isSuccess = isResponseSuccess(resp.status)
    runInAction(() => {
      this.updatingAssetList.delete(id)
      this.updatingAssetList = this.updatingAssetList
    })
    if (!isSuccess) return

    runInAction(() => {
      this.items = this.items.filter(item => item.id !== id)
    })
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



