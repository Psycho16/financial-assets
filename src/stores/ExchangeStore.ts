import { makeAutoObservable, runInAction } from 'mobx'
import { USER_ID_KEY } from '../constants/localStorage'
import { axiosClient, PATHS } from '../utils/axios'
import { isResponseSuccess } from '../utils/isResponseSuccess'
import { getMoexBoardLink } from '../utils/getMoexBoardLink'

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
  errorReason: string
}

type UpdatedAsset = Omit<ExchangeAsset, "totalPrice" | "changePercent" | "price">

const recalculateTotalPrice = (price: number, quantity: number) => {
  return price * quantity
}

const isMarketDataCorrect = (data: unknown): data is { marketdata: { columns: string[], data: unknown[] } } => {
  typeof data === 'object' && data !== null && "marketdata" in data
  return typeof data === 'object' && data !== null && "marketdata" in data && typeof data.marketdata === 'object' && data.marketdata !== null && "columns" in data.marketdata && Array.isArray(data.marketdata.columns) && "data" in data.marketdata && Array.isArray(data.marketdata.data)
}

const getAssetDataPromise = async (assetData: ExchangeAsset): Promise<ExchangeAsset> => {
  const { ticker, boardName } = assetData
  if (!ticker || !boardName) return {
    ...assetData,
    price: 0,
    totalPrice: 0,
    changePercent: 0,
  }
  const boardLink = getMoexBoardLink(ticker, boardName)

  const moexResp = await fetch(boardLink, {
    credentials: "omit",
  })

  const data = await moexResp.json();

  const columns: string[] = isMarketDataCorrect(data) ? data?.marketdata?.columns : []
  const dataRows: any[] = isMarketDataCorrect(data) ? data?.marketdata?.data : []
  const marketPriceIdx = columns.indexOf('MARKETPRICE')
  const lastPriceIdx = columns.indexOf('LAST')
  const lastToPrevPriceIdx = columns.indexOf('LASTTOPREVPRICE')
  const row = Array.isArray(dataRows) && dataRows.length > 0 ? dataRows[0] : undefined

  const marketPrice = marketPriceIdx !== -1 && row ? Number(row[marketPriceIdx]) : NaN
  const last = lastPriceIdx !== -1 && row && Number(row[lastPriceIdx]) > 0 ? Number(row[lastPriceIdx]) : marketPrice
  const prcnt = (lastToPrevPriceIdx !== -1 && row ? Number(row[lastToPrevPriceIdx]) : NaN) ?? 0

  const stringifiedTotalPrice = (last * (assetData.quantity || 0)).toFixed(2)
  return {
    ...assetData,
    price: last,
    totalPrice: +stringifiedTotalPrice,
    changePercent: prcnt,
  }
}


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

  async loadAssets() {
    runInAction(() => {
      this.isLoading = true
    })
    try {
      const userId = localStorage.getItem(USER_ID_KEY)
      if (!userId) return
      const resp = await axiosClient.get<{ userAssets: ExchangeAsset[] }>(PATHS.USER_ASSETS.GET, { params: { userId } })
      const userAssets = resp?.data?.userAssets

      if (!userAssets || !Array.isArray(userAssets)) {
        runInAction(() => {
          this.items = []
        })
        return
      }
      const hasErrorInAssetsWithPrices = userAssets.some(item => item.errorReason !== "")

      if (hasErrorInAssetsWithPrices) {
        runInAction(() => {
          this.items = userAssets
        })
        const userAssetsWithPrice = await Promise.all(userAssets.map(async (assetData) => {
          runInAction(() => {
            this.updatingAssetList.add(assetData.id)
            this.updatingAssetList = this.updatingAssetList
          })
          return getAssetDataPromise(assetData)
        }))
        runInAction(() => {
          userAssetsWithPrice.map(assetData => {
            this.updatingAssetList.delete(assetData.id)
            this.updatingAssetList = this.updatingAssetList
          })
          this.items = userAssetsWithPrice
        })
        return
      }

      runInAction(() => {
        this.items = userAssets
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



