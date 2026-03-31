import { validateLicenseKey } from '../utils/licenseStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    licenseKey?: string
    domain?: string
  }>(event)

  if (!body.licenseKey?.trim() || !body.domain?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'licenseKey and domain are required' })
  }

  const result = await validateLicenseKey(body.licenseKey.trim(), body.domain.trim())

  if (!result.valid) {
    throw createError({ statusCode: 403, statusMessage: result.reason, data: result })
  }

  return result
})
