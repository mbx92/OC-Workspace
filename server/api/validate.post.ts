import { validateLicenseKey } from '../services/licenses'
import { validateLicenseSchema } from '../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = validateLicenseSchema.parse(body)

  return validateLicenseKey(data.licenseKey, data.domain)
})