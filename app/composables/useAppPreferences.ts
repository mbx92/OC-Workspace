export type AppLanguage = 'en' | 'id'
export type AppCurrency = 'IDR' | 'USD' | 'EUR'

type AppPreferences = {
  language: AppLanguage
  currency: AppCurrency
}

export function useAppPreferences() {
  const preferences = useState<AppPreferences>('app-preferences', () => ({
    language: 'en',
    currency: 'IDR',
  }))

  const language = computed<AppLanguage>({
    get: () => preferences.value.language,
    set: value => { preferences.value.language = value },
  })

  const currency = computed<AppCurrency>({
    get: () => preferences.value.currency,
    set: value => { preferences.value.currency = value },
  })

  const locale = computed(() => language.value === 'id' ? 'id-ID' : 'en-US')

  const languageOptions: { value: AppLanguage, label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Bahasa Indonesia' },
  ]

  const currencyOptions: { value: AppCurrency, label: string }[] = [
    { value: 'IDR', label: 'IDR' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
  ]

  return {
    preferences,
    language,
    currency,
    locale,
    languageOptions,
    currencyOptions,
  }
}
