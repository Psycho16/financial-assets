import { makeAutoObservable, runInAction } from 'mobx'
import { USER_ID_KEY } from '../constants/localStorage'
import { axiosClient, PATHS } from '../utils/axios'
import { isResponseSuccess } from '../utils/isResponseSuccess'

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
  updatingDepositList = new Set()

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

  async update(id: string, changes: Partial<Omit<Deposit, 'id'>>) {
     runInAction(() => {
          this.updatingDepositList.add(id)
          this.updatingDepositList = this.updatingDepositList
        })
    const resp = await axiosClient.patch(PATHS.USER_DEPOSITS.EDIT_AMOUNT, {
      depositId: id,
      amount: changes.amount,
    })

    const isSuccess = isResponseSuccess(resp.status)
    const updateDeposit = resp.data

     if (!!updateDeposit && isSuccess) {
          runInAction(() => {
            this.items = this.items.map<Deposit>((item) => {
              if (item.id === updateDeposit.id) {
                return {
                  ...updateDeposit,
                  
                }
              }
    
              return {
                ...item
              }
            })
          })
        }

         runInAction(() => {
      this.updatingDepositList.delete(id)
      this.updatingDepositList = this.updatingDepositList
    })

  }
  
  async updateDeposit(id: string, changes: Pick<Deposit, 'name' | 'endDate' | 'ratePercent'>) {
    runInAction(() => {
          this.updatingDepositList.add(id)
          this.updatingDepositList = this.updatingDepositList
        })
        
        const resp = await axiosClient.patch<Deposit>(PATHS.USER_DEPOSITS.EDIT_DEPOSIT, {
          depositId: id,
          name: changes.name,
          endDate: changes.endDate,
          ratePercent: changes.ratePercent,
        })
    
        const updatedDeposit = resp.data
        const isSuccess = isResponseSuccess(resp.status)

        if (!!updatedDeposit && isSuccess) {
          runInAction(() => {
            this.items = this.items.map<Deposit>((item) => {
              if (item.id === updatedDeposit.id) {
                return {
                  ...updatedDeposit,
                }
              }

              return {
                ...item
              }
            })
          })
        }
    
        runInAction(() => {
          this.updatingDepositList.delete(id)
          this.updatingDepositList = this.updatingDepositList
        })
    
      }

  async remove(id: string) {
       runInAction(() => {
      this.updatingDepositList.add(id)
      this.updatingDepositList = this.updatingDepositList
    })

    const resp = await axiosClient.delete(PATHS.USER_DEPOSITS.DELETE, {
      params: {
        depositId: id,
      }
    })

    const isSuccess = isResponseSuccess(resp.status)
    runInAction(() => {
      this.updatingDepositList.delete(id)
      this.updatingDepositList = this.updatingDepositList
    })
   if (!isSuccess) return

    runInAction(() => {
      this.items = this.items.filter(item => item.id !== id)
    })
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


