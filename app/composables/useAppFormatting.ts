import type { AppCurrency } from '~/composables/useAppPreferences'

export function useAppFormatting() {
  const { locale, currency } = useAppPreferences()

  function formatCurrency(value: number, selectedCurrency?: AppCurrency) {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: selectedCurrency || currency.value,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat(locale.value, {
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  function parseNumericInput(value: string) {
    const normalized = value.replace(/[^\d-]/g, '')
    if (!normalized || normalized === '-') {
      return 0
    }

    const parsed = Number.parseInt(normalized, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  function formatNumberInput(value: string | number) {
    if (typeof value === 'string' && !value.replace(/[^\d-]/g, '')) {
      return ''
    }

    return formatNumber(typeof value === 'number' ? value : parseNumericInput(value))
  }

  return {
    formatCurrency,
    formatNumber,
    parseNumericInput,
    formatNumberInput,
  }
}
