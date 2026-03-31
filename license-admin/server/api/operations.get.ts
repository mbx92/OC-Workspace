import { requireAuth } from '../utils/auth'
import { listOperations } from '../utils/licenseStore'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return listOperations(50)
})