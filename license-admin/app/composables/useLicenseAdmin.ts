export interface LicenseRecord {
  id: string
  licenseKey: string
  clientName: string
  clientEmail: string | null
  domain: string
  plan: string
  features: string[]
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface OperationLogRecord {
  id: string
  type: 'create' | 'update' | 'delete' | 'validate' | 'login' | 'logout'
  title: string
  subject: string
  actor: string
  detail: string
  tone: 'success' | 'warning' | 'error' | 'info'
  createdAt: string
}

export interface LicenseStats {
  total: number
  active: number
  expiring: number
  suspended: number
}

export interface PlanRecord {
  id: string
  name: string
  slug: string
  description: string | null
  features: string[]
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export const LICENSE_FEATURE_OPTIONS = [
  { value: 'validation', label: 'Validation', caption: 'License verification endpoint' },
  { value: 'media', label: 'Media', caption: 'Asset and upload management' },
  { value: 'shop', label: 'Shop', caption: 'Product and checkout modules' },
  { value: 'blog', label: 'Blog', caption: 'Publishing and article workflows' },
  { value: 'booking', label: 'Booking', caption: 'Reservation and schedule flows' },
  { value: 'analytics', label: 'Analytics', caption: 'Operational reporting access' },
] as const

export interface ValidationSuccess {
  valid: true
  plan: string
  features: string[]
  expiresAt: string | null
}

export function getLicenseStatus(record: LicenseRecord) {
  if (!record.isActive) {
    return 'Suspended'
  }

  if (record.expiresAt) {
    const expiryTime = new Date(record.expiresAt).getTime()

    if (!Number.isNaN(expiryTime) && expiryTime < Date.now() + (7 * 24 * 60 * 60 * 1000)) {
      return 'Expiring Soon'
    }
  }

  return 'Healthy'
}

export function getStatusBadge(status: string) {
  if (status === 'Healthy' || status === 'success') {
    return 'badge-success'
  }

  if (status === 'Expiring Soon' || status === 'warning') {
    return 'badge-warning'
  }

  if (status === 'Suspended' || status === 'error') {
    return 'badge-error'
  }

  if (status === 'info') {
    return 'badge-info'
  }

  return 'badge-ghost'
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Not scheduled'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDateOnly(value: string | null | undefined) {
  if (!value) {
    return 'No expiry'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
  }).format(new Date(value))
}