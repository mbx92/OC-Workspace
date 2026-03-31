import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import pg from 'pg'

type MigrationCheck = {
  tag: string
  when: number
  isApplied: (client: pg.PoolClient) => Promise<boolean>
}

function normalizeDatabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl)
  url.searchParams.delete('schema')
  return url.toString()
}

async function tableExists(client: pg.PoolClient, schema: string, table: string) {
  const result = await client.query<{ exists: boolean }>(
    `
      select exists (
        select 1
        from information_schema.tables
        where table_schema = $1 and table_name = $2
      ) as exists
    `,
    [schema, table],
  )

  return result.rows[0]?.exists ?? false
}

async function columnExists(client: pg.PoolClient, schema: string, table: string, column: string) {
  const result = await client.query<{ exists: boolean }>(
    `
      select exists (
        select 1
        from information_schema.columns
        where table_schema = $1 and table_name = $2 and column_name = $3
      ) as exists
    `,
    [schema, table, column],
  )

  return result.rows[0]?.exists ?? false
}

async function computeMigrationHash(tag: string) {
  const filePath = path.resolve('server/db/migrations', `${tag}.sql`)
  const content = await readFile(filePath)
  return createHash('sha256').update(content).digest('hex')
}

async function ensureLegacyMigrationHistory(client: pg.PoolClient) {
  await client.query('create schema if not exists drizzle')
  await client.query(`
    create table if not exists drizzle.__drizzle_migrations (
      id integer primary key generated always as identity,
      hash text not null,
      created_at bigint not null
    )
  `)

  const existingRows = await client.query<{ id: number; hash: string }>('select id, hash from drizzle.__drizzle_migrations order by id')
  const existingHashes = new Set(existingRows.rows.map(row => row.hash))

  const checks: MigrationCheck[] = [
    {
      tag: '0000_exotic_goblin_queen',
      when: 1774143807787,
      isApplied: (dbClient) => tableExists(dbClient, 'public', 'projects'),
    },
    {
      tag: '0001_needy_luke_cage',
      when: 1774185835689,
      isApplied: (dbClient) => tableExists(dbClient, 'public', 'bug_assignees'),
    },
    {
      tag: '0002_integration_api_key',
      when: 1742688000000,
      isApplied: (dbClient) => columnExists(dbClient, 'public', 'integration_connections', 'api_key_hash'),
    },
    {
      tag: '0003_ambiguous_silk_fever',
      when: 1774241020844,
      isApplied: (dbClient) => tableExists(dbClient, 'public', 'integration_webhook_deliveries'),
    },
    {
      tag: '0004_awesome_lady_bullseye',
      when: 1774241895073,
      isApplied: async (dbClient) => {
        const hasContractValue = await columnExists(dbClient, 'public', 'projects', 'contract_value')
        const hasCurrency = await columnExists(dbClient, 'public', 'projects', 'currency')
        return hasContractValue && hasCurrency
      },
    },
    {
      tag: '0005_project_license_registry',
      when: 1774922400000,
      isApplied: async (dbClient) => {
        const hasPlansTable = await tableExists(dbClient, 'public', 'license_plans')
        const hasPlanId = await columnExists(dbClient, 'public', 'project_licenses', 'plan_id')
        return hasPlansTable && hasPlanId
      },
    },
  ]

  for (const check of checks) {
    const hash = await computeMigrationHash(check.tag)

    if (existingHashes.has(hash)) {
      continue
    }

    if (!(await check.isApplied(client))) {
      continue
    }

    await client.query(
      'insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)',
      [hash, check.when],
    )
  }
}

async function runDrizzleMigrate(databaseUrl: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.resolve('node_modules/drizzle-kit/bin.cjs'), 'migrate', '--config=drizzle.config.ts'],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
        },
      },
    )

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`drizzle-kit migrate exited with code ${code ?? 'unknown'}`))
    })

    child.on('error', reject)
  })
}

async function main() {
  const rawDatabaseUrl = process.env.DATABASE_URL

  if (!rawDatabaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl)
  const pool = new pg.Pool({ connectionString: databaseUrl })

  try {
    const client = await pool.connect()

    try {
      await ensureLegacyMigrationHistory(client)
    }
    finally {
      client.release()
    }

    await runDrizzleMigrate(databaseUrl)
  }
  finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})