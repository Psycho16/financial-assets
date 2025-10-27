import { makeAutoObservable } from "mobx"

const TOKEN = "t.uUmx8ZhdjheQf-nXBXzKsrkMP6Vbb9MoVOeQ_z7soQMVgBHfzHsQ-FNEko6L5xJEV5rp5Qr4vxzXS97YN11AHQ"

export class TInvestmentsStore {
  constructor() {
    makeAutoObservable(this)
  }

  async fetchInstrument(ticker: string) {
    const res = await fetch("https://invest-public-api.tbank.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/FindInstrument", {
      method: "POST",
      body: JSON.stringify({
        "query": ticker,
        "instrumentKind": "INSTRUMENT_TYPE_UNSPECIFIED",
        "apiTradeAvailableFlag": false
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    })

    const data = await res.json()
    return data.instruments
  }

  async fetchDividends(instrumentId: string) {
    const res = await fetch("https://invest-public-api.tbank.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetDividends", {
      method: "POST",
      body: JSON.stringify({
        // from: "2025-10-23T09:57:20.558Z",
        from: new Date().toISOString(),
        // to: "2026-10-23T09:57:20.558Z",
        instrumentId
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    })

    const data = await res.json()
    return data.dividends
  }
}

export const tInvestmentsStore = new TInvestmentsStore()