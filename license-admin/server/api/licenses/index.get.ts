import { listLicenses } from '../../utils/licenseStore'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return listLicenses()
})
