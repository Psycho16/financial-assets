export const getMoexBoardLink = (secid: string, boardName: string) => {
  if (boardName === "CETS") {
    return `https://iss.moex.com/iss/engines/currency/markets/selt/boards/CETS/securities/${encodeURIComponent(secid)}.json?iss.meta=off&iss.only=marketdata&lang=ru`
  }

  return `https://iss.moex.com/iss/engines/stock/markets/shares/boards/${boardName}/securities/${encodeURIComponent(secid)}.json?iss.meta=off&iss.only=marketdata&lang=ru`
}