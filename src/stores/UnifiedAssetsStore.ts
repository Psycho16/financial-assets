import { makeAutoObservable } from 'mobx'
import { depositStore, type Deposit } from './DepositStore'
import { exchangeStore, type ExchangeAsset } from './ExchangeStore'
import { moexStore } from './MoexStore'

export type ExchangeT = "exchange"
export type DepositT = "deposit"

export type UnifiedExchangeAsset = {
  id: string
  type: ExchangeT
  data: ExchangeAsset
}

export type UnifiedDepositAsset = {
  id: string
  type: DepositT
  data: Deposit
}

export type UnifiedAsset = UnifiedDepositAsset | UnifiedExchangeAsset

export type AssetSummary = {
  totalValue: number
  depositValue: number
  exchangeValue: number
  depositCount: number
  exchangeCount: number
}

export class UnifiedAssetsStore {
  constructor() {
    makeAutoObservable(this)
  }

  get allAssets(): UnifiedAsset[] {
    const deposits: UnifiedAsset[] = depositStore.items.map(deposit => ({
      id: deposit.id,
      type: 'deposit',
      data: deposit
    }))

    const exchanges: UnifiedAsset[] = exchangeStore.items.map(exchange => ({
      id: exchange.id,
      type: 'exchange',
      data: exchange
    }))

    return [...deposits, ...exchanges]
  }

  get summary(): AssetSummary {
    const depositValue = depositStore.items.reduce((sum, deposit) => sum + deposit.amount, 0)
    const exchangeValue = exchangeStore.items.reduce((sum, exchange) => {
      const price = moexStore.getPrice(exchange.ticker)
      return sum + (price !== undefined ? price * exchange.quantity : 0)
    }, 0)

    return {
      totalValue: depositValue + exchangeValue,
      depositValue,
      exchangeValue,
      depositCount: depositStore.items.length,
      exchangeCount: exchangeStore.items.length
    }
  }

  addDeposit(item: Omit<Deposit, 'id'>) {
    depositStore.add(item)
  }

  addExchange(item: Omit<ExchangeAsset, 'id'>) {
    exchangeStore.add(item)
  }

  updateDeposit(id: string, changes: Partial<Omit<Deposit, 'id'>>) {
    depositStore.update(id, changes)
  }

  updateExchange(id: string, changes: Partial<Omit<ExchangeAsset, 'id'>>) {
    exchangeStore.update(id, changes)
  }

  removeDeposit(id: string) {
    depositStore.remove(id)
  }

  removeExchange(id: string) {
    exchangeStore.remove(id)
  }

  removeAsset(id: string, type: ExchangeT | DepositT) {
    if (type === 'deposit') {
      this.removeDeposit(id)
    } else {
      this.removeExchange(id)
    }
  }
}

export const unifiedAssetsStore = new UnifiedAssetsStore()
