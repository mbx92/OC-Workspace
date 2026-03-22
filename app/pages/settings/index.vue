<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">{{ t('settings.workspace') }}</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">{{ t('settings.title') }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          {{ t('settings.description') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/reports" class="btn btn-ghost btn-sm">{{ t('common.openReports') }}</NuxtLink>
        <NuxtLink to="/finance" class="btn btn-outline btn-sm">{{ t('sidebar.finance') }}</NuxtLink>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-title">{{ t('settings.activeLanguage') }}</div>
          <div class="stat-value text-primary text-2xl">{{ activeLanguageLabel }}</div>
          <div class="stat-desc">{{ t('settings.currentSelection') }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ t('settings.activeCurrency') }}</div>
          <div class="stat-value text-secondary text-2xl">{{ currency }}</div>
          <div class="stat-desc">{{ t('settings.currentSelection') }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ t('settings.scope') }}</div>
          <div class="stat-value text-info text-xl">Workspace</div>
          <div class="stat-desc">{{ t('settings.scopeDescription') }}</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <fieldset class="fieldset gap-4">
            <legend class="fieldset-legend text-base">{{ t('settings.preferencesCard') }}</legend>

            <p class="text-sm leading-6 text-base-content/70">{{ t('settings.preferencesHelp') }}</p>

            <label class="grid gap-2">
              <span class="text-xs font-medium uppercase tracking-[0.16em] text-base-content/45">{{ t('common.language') }}</span>
              <select v-model="language" class="select select-bordered w-full">
                <option v-for="option in languageOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <span class="label px-0 pb-0">{{ t('settings.languageHelp') }}</span>
            </label>

            <label class="grid gap-2">
              <span class="text-xs font-medium uppercase tracking-[0.16em] text-base-content/45">{{ t('common.currency') }}</span>
              <select v-model="currency" class="select select-bordered w-full">
                <option v-for="option in currencyOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <span class="label px-0 pb-0">{{ t('settings.currencyHelp') }}</span>
            </label>
          </fieldset>
        </div>
      </div>

      <div class="space-y-4">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">{{ t('settings.workspaceRules') }}</h2>
            <ul class="space-y-3 text-sm text-base-content/75">
              <li class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-primary" />
                {{ t('settings.ruleProjects') }}
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-secondary" />
                {{ t('settings.ruleFinance') }}
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-info" />
                {{ t('settings.ruleLegal') }}
              </li>
            </ul>
          </div>
        </div>

        <div role="alert" class="alert alert-soft alert-info items-start">
          <span>{{ t('sidebar.preferencesDescription') }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useAppI18n()
const { language, currency, languageOptions, currencyOptions } = useAppPreferences()

const activeLanguageLabel = computed(() =>
  languageOptions.find(option => option.value === language.value)?.label ?? language.value,
)
</script>