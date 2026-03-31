type LicenseStatus = 'Healthy' | 'Expiring Soon' | 'Suspended'
type NodeStatus = 'Online' | 'Maintenance' | 'Warning'
type OperationTone = 'success' | 'warning' | 'error' | 'info'

interface LicenseAccount {
  id: string
  company: string
  admin: string
  plan: string
  domain: string
  seats: string
  renewalDate: string
  status: LicenseStatus
  region: string
  lastValidation: string
  features: string[]
}

interface OperationEntry {
  id: string
  action: string
  subject: string
  operator: string
  timestamp: string
  tone: OperationTone
  detail: string
}

interface OperationQueueItem {
  id: string
  tenant: string
  action: string
  requestedBy: string
  lane: string
  risk: 'Low' | 'Medium' | 'High'
  state: 'Pending Review' | 'Ready' | 'Awaiting Approval'
  eta: string
}

interface InfrastructureNode {
  id: string
  name: string
  region: string
  health: string
  status: NodeStatus
  latency: string
  traffic: string
}

const licenseAccounts: LicenseAccount[] = [
  {
    id: 'LIC-2048',
    company: 'Pebbles Bali Studio',
    admin: 'Dinda Rahma',
    plan: 'Enterprise',
    domain: 'cms.pebblesbali.com',
    seats: '14 admins',
    renewalDate: '18 Apr 2026',
    status: 'Healthy',
    region: 'Singapore',
    lastValidation: '2 minutes ago',
    features: ['Multi-site', 'Audit trail', 'Role matrix', 'Webhook sync'],
  },
  {
    id: 'LIC-1892',
    company: 'Sense of Jewels',
    admin: 'Ayu Puspitasari',
    plan: 'Growth',
    domain: 'admin.senseofjewels.com',
    seats: '7 admins',
    renewalDate: '06 Apr 2026',
    status: 'Expiring Soon',
    region: 'Jakarta',
    lastValidation: '11 minutes ago',
    features: ['Sections', 'Blog', 'Media library'],
  },
  {
    id: 'LIC-1734',
    company: 'Teras Ubud Guesthouse',
    admin: 'Kadek Wira',
    plan: 'Hospitality',
    domain: 'ops.terasubud.id',
    seats: '4 admins',
    renewalDate: '12 Jun 2026',
    status: 'Healthy',
    region: 'Bali Edge',
    lastValidation: '26 minutes ago',
    features: ['Room inventory', 'Booking engine', 'Availability sync'],
  },
  {
    id: 'LIC-1610',
    company: 'Laut Timur Retail',
    admin: 'Rizky Dharma',
    plan: 'Commerce',
    domain: 'license.lauttimur.id',
    seats: '9 admins',
    renewalDate: '28 Mar 2026',
    status: 'Suspended',
    region: 'Singapore',
    lastValidation: '1 hour ago',
    features: ['Shop', 'Checkout', 'Payment connectors'],
  },
]

const operationEntries: OperationEntry[] = [
  {
    id: 'OP-391',
    action: 'License rotated',
    subject: 'LIC-2048',
    operator: 'System Admin',
    timestamp: 'Today, 09:42',
    tone: 'success',
    detail: 'Primary key rotated after scheduled security maintenance.',
  },
  {
    id: 'OP-388',
    action: 'Renewal reminder',
    subject: 'LIC-1892',
    operator: 'Automation',
    timestamp: 'Today, 08:10',
    tone: 'warning',
    detail: 'Reminder dispatched to finance and account owner.',
  },
  {
    id: 'OP-381',
    action: 'Access suspended',
    subject: 'LIC-1610',
    operator: 'Finance Ops',
    timestamp: 'Yesterday, 17:24',
    tone: 'error',
    detail: 'Service access paused after invoice grace period elapsed.',
  },
  {
    id: 'OP-377',
    action: 'Validation spike reviewed',
    subject: 'Bali Edge Node',
    operator: 'Platform Team',
    timestamp: 'Yesterday, 11:53',
    tone: 'info',
    detail: 'Traffic spike traced to deployment warm-up and cleared normally.',
  },
]

const operationQueue: OperationQueueItem[] = [
  {
    id: 'RQ-128',
    tenant: 'Pebbles Bali Studio',
    action: 'Rotate license key',
    requestedBy: 'Security Bot',
    lane: 'Security',
    risk: 'High',
    state: 'Awaiting Approval',
    eta: 'Needs approver',
  },
  {
    id: 'RQ-126',
    tenant: 'Sense of Jewels',
    action: 'Renewal grace extension',
    requestedBy: 'Finance Ops',
    lane: 'Commercial',
    risk: 'Medium',
    state: 'Pending Review',
    eta: '14 min',
  },
  {
    id: 'RQ-121',
    tenant: 'Teras Ubud Guesthouse',
    action: 'Issue backup domain binding',
    requestedBy: 'Support Desk',
    lane: 'Provisioning',
    risk: 'Low',
    state: 'Ready',
    eta: '4 min',
  },
  {
    id: 'RQ-118',
    tenant: 'Laut Timur Retail',
    action: 'Suspend domain access',
    requestedBy: 'Finance Ops',
    lane: 'Security',
    risk: 'High',
    state: 'Awaiting Approval',
    eta: 'Needs approver',
  },
]

const infrastructureNodes: InfrastructureNode[] = [
  {
    id: 'ND-01',
    name: 'Primary Validator',
    region: 'Singapore',
    health: '99.98%',
    status: 'Online',
    latency: '48 ms',
    traffic: '8.4k / hour',
  },
  {
    id: 'ND-02',
    name: 'Bali Edge Cache',
    region: 'Denpasar',
    health: '99.72%',
    status: 'Warning',
    latency: '86 ms',
    traffic: '3.2k / hour',
  },
  {
    id: 'ND-03',
    name: 'Jakarta Fallback',
    region: 'Jakarta',
    health: 'Scheduled patch',
    status: 'Maintenance',
    latency: '62 ms',
    traffic: '1.1k / hour',
  },
]

const quickActions = [
  {
    title: 'Issue new license',
    description: 'Provision a new tenant, bind domain, and assign plan access.',
    emphasis: 'Primary',
  },
  {
    title: 'Rotate license key',
    description: 'Re-issue credentials without interrupting active deployment sessions.',
    emphasis: 'Security',
  },
  {
    title: 'Suspend domain access',
    description: 'Pause validation while keeping the tenant record and audit history intact.',
    emphasis: 'Control',
  },
]

export function useLicenseMockups() {
  const accounts = computed(() => licenseAccounts)
  const operations = computed(() => operationEntries)
  const queue = computed(() => operationQueue)
  const nodes = computed(() => infrastructureNodes)
  const actions = computed(() => quickActions)

  const totalLicenses = computed(() => accounts.value.length)
  const healthyLicenses = computed(() => accounts.value.filter(account => account.status === 'Healthy').length)
  const expiringLicenses = computed(() => accounts.value.filter(account => account.status === 'Expiring Soon').length)
  const suspendedLicenses = computed(() => accounts.value.filter(account => account.status === 'Suspended').length)

  return {
    accounts,
    operations,
    queue,
    nodes,
    actions,
    totalLicenses,
    healthyLicenses,
    expiringLicenses,
    suspendedLicenses,
  }
}