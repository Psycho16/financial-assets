export function formatNumber(value: number | undefined | null, options?: { fractionDigits?: number }) {
  if (value === undefined || value === null || !Number.isFinite(Number(value))) return '-'
  const fractionDigits = options?.fractionDigits ?? 2
  // ru-RU uses non-breaking space as thousands separator
  return Number(value).toLocaleString('ru-RU', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}


