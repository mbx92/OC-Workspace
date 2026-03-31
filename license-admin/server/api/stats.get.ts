import { requireAuth } from '../utils/auth'
import { getLicenseStats } from '../utils/licenseStore'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return getLicenseStats()
})