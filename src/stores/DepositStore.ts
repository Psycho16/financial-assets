import { makeAutoObservable, runInAction } from 'mobx'
import { USER_ID_KEY } from '../constants/localStorage'
import { axiosClient, PATHS } from '../utils/axios'

export type Deposit = {
  id: string
  name: string
  endDate: string // ISO date string
  amount: number
  ratePercent: number
}
export class DepositStore {
  items: Deposit[] = []
  isLoading = false

  constructor() {
    makeAutoObservable(this)
    this.loadDeposits()
  }

  async add(item: Omit<Deposit, 'id'>) {
    const userId = localStorage.getItem(USER_ID_KEY)

    await axiosClient.post(PATHS.USER_DEPOSITS.ADD, {
      userId,
      ...item
    })

    await this.loadDeposits()
  }

  update(id: string, changes: Partial<Omit<Deposit, 'id'>>) {
    console.log(id, changes)
    // TODO: make update method
  }

  async remove(id: string) {
    await axiosClient.delete(PATHS.USER_DEPOSITS.DELETE, {
      params: {
        depositId: id,
      }
    })

    await this.loadDeposits()
  }

  private async loadDeposits() {
    runInAction(() => {
      this.isLoading = true
    })
    try {
      const userId = localStorage.getItem(USER_ID_KEY)
      const resp = await axiosClient.get<{ userDeposits: Deposit[] }>(PATHS.USER_DEPOSITS.GET, { params: { userId } })
      const userDeposits = resp?.data?.userDeposits

      if (!userDeposits) return

      runInAction(() => {
        this.items = Array.isArray(userDeposits)
          ? userDeposits
          : []
      })

    } catch {
      this.items = []
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }
}

export const depositStore = new DepositStore()


