<template>
  <div class="flex min-h-[calc(100vh-3.5rem)]">

    <!-- Left sidebar nav (desktop) -->
    <aside class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-base-300 bg-base-100 py-6 lg:block">
      <nav class="px-3 space-y-6">
        <div>
          <p class="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40">Memulai</p>
          <ul class="space-y-0.5">
            <li><a :class="navClass('overview')" href="#overview">Overview</a></li>
            <li><a :class="navClass('auth')" href="#auth">Autentikasi</a></li>
          </ul>
        </div>
        <div>
          <p class="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40">Koneksi</p>
          <ul class="space-y-0.5">
            <li>
              <a :class="navClass('list-conns')" href="#list-conns" class="flex items-center gap-1.5">
                <span class="badge badge-success badge-xs font-mono shrink-0">GET</span>
                <span class="truncate text-xs">/api/integrations</span>
              </a>
            </li>
            <li>
              <a :class="navClass('create-conn')" href="#create-conn" class="flex items-center gap-1.5">
                <span class="badge badge-primary badge-xs font-mono shrink-0">POST</span>
                <span class="truncate text-xs">/api/integrations</span>
              </a>
            </li>
            <li>
              <a :class="navClass('get-conn')" href="#get-conn" class="flex items-center gap-1.5">
                <span class="badge badge-success badge-xs font-mono shrink-0">GET</span>
                <span class="truncate text-xs">/:id</span>
              </a>
            </li>
            <li>
              <a :class="navClass('update-conn')" href="#update-conn" class="flex items-center gap-1.5">
                <span class="badge badge-warning badge-xs font-mono shrink-0">PATCH</span>
                <span class="truncate text-xs">/:id</span>
              </a>
            </li>
            <li>
              <a :class="navClass('rotate-key')" href="#rotate-key" class="flex items-center gap-1.5">
                <span class="badge badge-primary badge-xs font-mono shrink-0">POST</span>
                <span class="truncate text-xs">/:id/rotate-key</span>
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p class="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40">Sync &amp; Records</p>
          <ul class="space-y-0.5">
            <li>
              <a :class="navClass('mappings')" href="#mappings" class="flex items-center gap-1.5">
                <span class="badge badge-primary badge-xs font-mono shrink-0">POST</span>
                <span class="truncate text-xs">/:id/mappings</span>
              </a>
            </li>
            <li>
              <a :class="[navClass('push'), 'font-semibold']" href="#push" class="flex items-center gap-1.5">
                <span class="badge badge-primary badge-xs font-mono shrink-0">POST</span>
                <span class="truncate text-xs text-primary">/:id/push ★</span>
              </a>
            </li>
            <li>
              <a :class="navClass('sync')" href="#sync" class="flex items-center gap-1.5">
                <span class="badge badge-primary badge-xs font-mono shrink-0">POST</span>
                <span class="truncate text-xs">/:id/sync</span>
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p class="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40">Panduan</p>
          <ul class="space-y-0.5">
            <li><a :class="navClass('quickstart')" href="#quickstart">Quickstart CMS</a></li>
            <li><a :class="navClass('client-guide')" href="#client-guide">Panduan Client App</a></li>
            <li><a :class="navClass('webhook-guide')" href="#webhook-guide">Webhook Write-back</a></li>
            <li><a :class="navClass('reference')" href="#reference">Enums &amp; Tipe</a></li>
          </ul>
        </div>
      </nav>
    </aside>

    <!-- Main docs content -->
    <main class="min-w-0 flex-1 px-6 py-10 lg:px-12">
      <div class="mx-auto max-w-2xl xl:max-w-3xl space-y-20">

        <!-- ── OVERVIEW ────────────────────────────────────────── -->
        <section data-section="overview" id="overview" class="scroll-mt-20">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Integration Reference</p>
          <h1 class="text-4xl font-bold tracking-tight text-base-content mb-4">Integration API</h1>
          <p class="text-base text-base-content/75 leading-relaxed mb-6">
            Panduan lengkap untuk menghubungkan sistem eksternal — CMS, issue tracker, project tool, atau aplikasi internal — ke OCS Workspace melalui REST API.
            Daftarkan koneksi, definisikan field mapping, dan kirim data <em>(bug, task, halaman, developer, dll.)</em> secara real-time.
          </p>

          <!-- AI Agent / Download bar -->
          <div class="flex flex-wrap items-center gap-2 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 mb-2">
            <div class="flex items-center gap-1.5 text-xs text-base-content/50 mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2"/><path d="M12 8v4l3 3"/></svg>
              <span class="font-semibold">OpenAPI 3.0</span>
            </div>
            <a
              :href="`${origin}/api/docs/openapi.json`"
              :download="`ocs-integration-api.openapi.json`"
              class="btn btn-xs btn-primary gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download JSON
            </a>
            <button class="btn btn-xs btn-ghost gap-1.5" @click="copySpecUrl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              {{ specUrlCopied ? '✓ URL disalin' : 'Copy Spec URL' }}
            </button>
            <a
              :href="`${origin}/api/docs/openapi.json`"
              target="_blank"
              class="btn btn-xs btn-ghost gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View Raw
            </a>
            <span class="ml-auto text-[10px] text-base-content/35 hidden sm:inline">Kompatibel dengan Cursor, Claude, GPT-4, dan tool lainnya</span>
          </div>

          <div class="rounded-xl border border-base-300 bg-base-200/50 p-5 space-y-4">
            <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Arsitektur</p>
            <div class="grid grid-cols-3 gap-3 text-center text-sm">
              <div class="rounded-lg border border-base-300 bg-base-100 px-3 py-4">
                <div class="text-2xl mb-1">🏢</div>
                <div class="font-semibold text-xs">Sistem Eksternal</div>
                <div class="text-xs text-base-content/50 mt-1">CMS, Tracker, App</div>
              </div>
              <div class="flex flex-col items-center justify-center gap-1 text-base-content/40">
                <div class="text-xs font-mono">POST /push</div>
                <div class="text-lg">→</div>
                <div class="text-xs font-mono">session cookie</div>
              </div>
              <div class="rounded-lg border border-primary/30 bg-primary/5 px-3 py-4">
                <div class="text-2xl mb-1">🖥️</div>
                <div class="font-semibold text-xs text-primary">OCS Workspace</div>
                <div class="text-xs text-base-content/50 mt-1">External Records</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs text-base-content/70">
              <div class="flex items-start gap-2">
                <span class="mt-0.5 text-success">✓</span>
                <span>Records di-dedup otomatis berdasarkan <code class="font-mono bg-base-200 px-1 rounded">sourceId</code></span>
              </div>
              <div class="flex items-start gap-2">
                <span class="mt-0.5 text-success">✓</span>
                <span>Aman dipanggil berulang kali — idempotent</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="mt-0.5 text-success">✓</span>
                <span>Field <code class="font-mono bg-base-200 px-1 rounded">sourceEntityType</code> bebas (bug, task, dll.)</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="mt-0.5 text-success">✓</span>
                <span>Payload JSON tersimpan utuh untuk referensi</span>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
              <div class="text-2xl font-bold text-primary">8</div>
              <div class="text-xs text-base-content/50 mt-0.5">Endpoints</div>
            </div>
            <div class="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
              <div class="text-lg font-bold text-secondary">Cookie</div>
              <div class="text-xs text-base-content/50 mt-0.5">Session auth</div>
            </div>
            <div class="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
              <div class="text-lg font-bold text-success">Aktif</div>
              <div class="text-xs text-base-content/50 mt-0.5">Push endpoint</div>
            </div>
            <div class="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
              <div class="text-lg font-bold text-accent">Bebas</div>
              <div class="text-xs text-base-content/50 mt-0.5">Entity types</div>
            </div>
          </div>
        </section>

        <!-- ── AUTHENTICATION ──────────────────────────────────── -->
        <section data-section="auth" id="auth" class="scroll-mt-20">
          <div class="docs-section-label">Memulai</div>
          <h2 class="docs-h2">Autentikasi</h2>
          <p class="docs-desc">
            Ada dua cara autentikasi di API ini, tergantung siapa yang memanggil:
          </p>

          <div class="mt-4 space-y-3">
            <div class="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
              <div class="flex items-center gap-2">
                <span class="badge badge-primary badge-sm font-mono">Bearer API Key</span>
                <span class="text-xs font-semibold text-base-content">Untuk sistem eksternal (push &amp; sync)</span>
              </div>
              <p class="text-sm text-base-content/70">API key di-generate otomatis saat koneksi dibuat. Kirim sebagai header <code class="docs-code">Authorization: Bearer &lt;api_key&gt;</code>. Key hanya tampil sekali — simpan segera. Bisa di-rotate kapan saja.</p>
            </div>
            <div class="rounded-lg border border-base-300 bg-base-200/40 p-4 space-y-2">
              <div class="flex items-center gap-2">
                <span class="badge badge-outline badge-sm font-mono">Cookie Session</span>
                <span class="text-xs font-semibold text-base-content">Untuk manajemen koneksi (create, update, dll.)</span>
              </div>
              <p class="text-sm text-base-content/70">Login via <code class="docs-code">POST /api/auth/login</code> → cookie <code class="docs-code">session_token</code> di-set otomatis. Kirim cookie di setiap request berikutnya. Memerlukan role <code class="docs-code">admin+</code>.</p>
            </div>
          </div>

          <div class="docs-code-block mt-5">
            <div class="docs-code-header">
              <span>Login &amp; simpan cookie (untuk manajemen)</span>
              <button class="docs-copy-btn" @click="copy('auth', authExample)">
                {{ copied === 'auth' ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/auth/login \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" \</code></pre>
              <pre data-prefix=" "><code>  -d '{"email":"admin@example.com","password":"xxxx"}' \</code></pre>
              <pre data-prefix=" "><code>  -c cookies.txt</code></pre>
            </div>
          </div>

          <div class="docs-code-block mt-3">
            <div class="docs-code-header">
              <span>Push record menggunakan API key (untuk sistem eksternal)</span>
              <button class="docs-copy-btn" @click="copy('auth-key', authKeyExample)">
                {{ copied === 'auth-key' ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/push \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" \</code></pre>
              <pre data-prefix=" "><code>  -H "Authorization: Bearer ocs_YOUR_API_KEY" \</code></pre>
              <pre data-prefix=" "><code>  -d '{"sourceId":"BUG-1","sourceEntityType":"bug"}'</code></pre>
            </div>
          </div>

          <div class="mt-4 rounded-lg border border-base-300 overflow-hidden">
            <table class="table table-xs">
              <thead class="bg-base-200/60"><tr><th>Role</th><th>Level</th><th>Akses</th></tr></thead>
              <tbody>
                <tr><td class="font-mono">owner</td><td>100</td><td>Semua operasi</td></tr>
                <tr><td class="font-mono">admin</td><td>90</td><td>Semua operasi termasuk write</td></tr>
                <tr><td class="font-mono">project_manager</td><td>70</td><td>Read (GET) saja</td></tr>
                <tr><td class="font-mono">developer / qa</td><td>40</td><td>Tidak ada akses integrasi</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ── LIST CONNECTIONS ────────────────────────────────── -->
        <section data-section="list-conns" id="list-conns" class="scroll-mt-20">
          <div class="docs-section-label">Koneksi</div>
          <div class="docs-endpoint-header">
            <span class="badge badge-success font-mono font-bold px-2">GET</span>
            <code class="docs-endpoint-path">/api/integrations</code>
            <span class="badge badge-outline badge-sm ml-auto shrink-0">project_manager+</span>
          </div>
          <p class="docs-desc mt-3">List semua integration connections. Filter opsional per project.</p>
          <div class="mt-4 rounded-lg border border-base-300 overflow-hidden">
            <table class="table table-xs">
              <thead class="bg-base-200/60"><tr><th>Query Param</th><th>Tipe</th><th>Wajib</th><th>Keterangan</th></tr></thead>
              <tbody>
                <tr><td class="font-mono">projectId</td><td>uuid</td><td><span class="text-base-content/40">Tidak</span></td><td>Filter berdasarkan project</td></tr>
              </tbody>
            </table>
          </div>
          <div class="docs-code-block mt-4">
            <div class="docs-code-header">
              <span>Request</span>
              <button class="docs-copy-btn" @click="copy('list-conns', listConnsExample)">{{ copied === 'list-conns' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl "{{ origin }}/api/integrations?projectId=PROJECT_UUID" \</code></pre>
              <pre data-prefix=" "><code>  -b cookies.txt</code></pre>
            </div>
          </div>
        </section>

        <!-- ── CREATE CONNECTION ───────────────────────────────── -->
        <section data-section="create-conn" id="create-conn" class="scroll-mt-20">
          <div class="docs-endpoint-header">
            <span class="badge badge-primary font-mono font-bold px-2">POST</span>
            <code class="docs-endpoint-path">/api/integrations</code>
            <span class="badge badge-outline badge-sm ml-auto shrink-0">admin+</span>
          </div>
          <p class="docs-desc mt-3">Daftarkan koneksi baru. Lakukan sekali di awal setup, lalu simpan <code class="docs-code">CONNECTION_UUID</code> dari response.</p>
          <div class="mt-4 rounded-lg border border-base-300 overflow-hidden">
            <table class="table table-xs">
              <thead class="bg-base-200/60"><tr><th>Field</th><th>Tipe</th><th>Wajib</th><th>Keterangan</th></tr></thead>
              <tbody>
                <tr><td class="font-mono">name</td><td>string</td><td><span class="text-error font-medium">Ya</span></td><td>Nama koneksi, 1–255 karakter</td></tr>
                <tr><td class="font-mono">providerType</td><td>enum</td><td><span class="text-error font-medium">Ya</span></td><td><code class="docs-code-sm">rest_api</code> <code class="docs-code-sm">graphql</code> <code class="docs-code-sm">webhook</code> <code class="docs-code-sm">database</code> <code class="docs-code-sm">file_import</code> <code class="docs-code-sm">custom</code></td></tr>
                <tr><td class="font-mono">projectId</td><td>uuid</td><td><span class="text-base-content/40">Tidak</span></td><td>Kaitkan ke project tertentu</td></tr>
                <tr><td class="font-mono">baseUrl</td><td>url</td><td><span class="text-base-content/40">Tidak</span></td><td>Base URL provider eksternal</td></tr>
                <tr><td class="font-mono">authType</td><td>enum</td><td><span class="text-base-content/40">Tidak</span></td><td><code class="docs-code-sm">none</code> <code class="docs-code-sm">api_key</code> <code class="docs-code-sm">bearer_token</code> <code class="docs-code-sm">basic_auth</code> <code class="docs-code-sm">oauth2</code></td></tr>
              </tbody>
            </table>
          </div>
          <div class="docs-code-block mt-4">
            <div class="docs-code-header">
              <span>Request</span>
              <button class="docs-copy-btn" @click="copy('create-conn', createConnExample)">{{ copied === 'create-conn' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" -b cookies.txt \</code></pre>
              <pre data-prefix=" "><code>  -d '{</code></pre>
              <pre data-prefix=" "><code>    "name": "My CMS",</code></pre>
              <pre data-prefix=" "><code>    "providerType": "rest_api",</code></pre>
              <pre data-prefix=" "><code>    "baseUrl": "https://cms.mycompany.com",</code></pre>
              <pre data-prefix=" "><code>    "authType": "bearer_token",</code></pre>
              <pre data-prefix=" "><code>    "projectId": "PROJECT_UUID"</code></pre>
              <pre data-prefix=" "><code>  }'</code></pre>
            </div>
            <div class="docs-code-response">
              <pre class="text-xs text-success/80 font-mono">&#8594;  { "id": "CONNECTION_UUID", "name": "My CMS", "status": "active", ... }</pre>
            </div>
          </div>
        </section>

        <!-- ── GET CONNECTION ──────────────────────────────────── -->
        <section data-section="get-conn" id="get-conn" class="scroll-mt-20">
          <div class="docs-endpoint-header">
            <span class="badge badge-success font-mono font-bold px-2">GET</span>
            <code class="docs-endpoint-path">/api/integrations/:id</code>
            <span class="badge badge-outline badge-sm ml-auto shrink-0">project_manager+</span>
          </div>
          <p class="docs-desc mt-3">Ambil detail lengkap koneksi dalam satu response: konfigurasi, field mappings, riwayat sync jobs, dan semua external records.</p>
          <div class="docs-code-block mt-4">
            <div class="docs-code-header">
              <span>Request</span>
              <button class="docs-copy-btn" @click="copy('get-conn', getConnExample)">{{ copied === 'get-conn' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl {{ origin }}/api/integrations/CONNECTION_UUID \</code></pre>
              <pre data-prefix=" "><code>  -b cookies.txt</code></pre>
            </div>
            <div class="docs-code-response">
              <pre class="text-xs text-success/80 font-mono whitespace-pre-wrap">&#8594;  {
  "connection": { "id": "...", "name": "My CMS", "status": "active", ... },
  "mappings":   [ { "sourceField": "cms_title", "targetField": "title" } ],
  "syncJobs":   [ { "jobType": "full_sync", "status": "succeeded", ... } ],
  "records":    [ { "sourceId": "BUG-42", "sourceEntityType": "bug", ... } ]
}</pre>
            </div>
          </div>
        </section>

        <!-- ── UPDATE CONNECTION ───────────────────────────────── -->
        <section data-section="update-conn" id="update-conn" class="scroll-mt-20">
          <div class="docs-endpoint-header">
            <span class="badge badge-warning font-mono font-bold px-2">PATCH</span>
            <code class="docs-endpoint-path">/api/integrations/:id</code>
            <span class="badge badge-outline badge-sm ml-auto shrink-0">admin+</span>
          </div>
          <p class="docs-desc mt-3">Update properti koneksi. Semua field opsional — hanya kirim field yang ingin diubah (partial update).</p>
          <div class="docs-code-block mt-4">
            <div class="docs-code-header">
              <span>Request</span>
              <button class="docs-copy-btn" @click="copy('update-conn', updateConnExample)">{{ copied === 'update-conn' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl -X PATCH {{ origin }}/api/integrations/CONNECTION_UUID \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" -b cookies.txt \</code></pre>
              <pre data-prefix=" "><code>  -d '{"name": "CMS v2", "authType": "api_key"}'</code></pre>
            </div>
          </div>
        </section>

        <!-- ── ROTATE API KEY ──────────────────────────────────── -->
        <section data-section="rotate-key" id="rotate-key" class="scroll-mt-20">
          <div class="docs-endpoint-header">
            <span class="badge badge-primary font-mono font-bold px-2">POST</span>
            <code class="docs-endpoint-path">/api/integrations/:id/rotate-key</code>
            <span class="badge badge-outline badge-sm ml-auto shrink-0">admin+</span>
          </div>
          <p class="docs-desc mt-3">
            Generate API key baru untuk koneksi ini. <strong>Key lama langsung tidak berlaku.</strong>
            Response mengembalikan plain-text key — satu-satunya kesempatan untuk melihatnya. Simpan segera.
          </p>
          <div class="docs-code-block mt-4">
            <div class="docs-code-header">
              <span>Request</span>
              <button class="docs-copy-btn" @click="copy('rotate-key', rotateKeyExample)">{{ copied === 'rotate-key' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/rotate-key \</code></pre>
              <pre data-prefix=" "><code>  -b cookies.txt</code></pre>
            </div>
            <div class="docs-code-response">
              <pre class="text-xs text-success/80 font-mono">&#8594;  { "id": "...", "name": "My CMS", "apiKey": "ocs_a1b2c3d4..." }</pre>
            </div>
          </div>
        </section>

        <!-- ── FIELD MAPPINGS ──────────────────────────────────── -->
        <section data-section="mappings" id="mappings" class="scroll-mt-20">
          <div class="docs-section-label">Sync &amp; Records</div>
          <div class="docs-endpoint-header">
            <span class="badge badge-primary font-mono font-bold px-2">POST</span>
            <code class="docs-endpoint-path">/api/integrations/:id/mappings</code>
            <span class="badge badge-outline badge-sm ml-auto shrink-0">admin+</span>
          </div>
          <p class="docs-desc mt-3">
            Tambahkan aturan mapping field. Mendefinisikan bagaimana field dari sistem sumber dipetakan ke field di workspace ini.
            Contoh: <code class="docs-code">cms_title</code> &rarr; <code class="docs-code">title</code>.
          </p>
          <div class="mt-4 rounded-lg border border-base-300 overflow-hidden">
            <table class="table table-xs">
              <thead class="bg-base-200/60"><tr><th>Field</th><th>Tipe</th><th>Wajib</th><th>Keterangan</th></tr></thead>
              <tbody>
                <tr><td class="font-mono">sourceField</td><td>string</td><td><span class="text-error font-medium">Ya</span></td><td>Nama field di sistem eksternal</td></tr>
                <tr><td class="font-mono">targetField</td><td>string</td><td><span class="text-error font-medium">Ya</span></td><td>Field target di workspace</td></tr>
                <tr><td class="font-mono">transformRule</td><td>string</td><td><span class="text-base-content/40">Tidak</span></td><td>Aturan transformasi opsional</td></tr>
              </tbody>
            </table>
          </div>
          <div class="docs-code-block mt-4">
            <div class="docs-code-header">
              <span>Request</span>
              <button class="docs-copy-btn" @click="copy('mappings', mappingsExample)">{{ copied === 'mappings' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/mappings \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" -b cookies.txt \</code></pre>
              <pre data-prefix=" "><code>  -d '{"sourceField": "issue.title", "targetField": "title"}'</code></pre>
            </div>
          </div>
        </section>

        <!-- ── PUSH RECORDS ★ ──────────────────────────────────── -->
        <section data-section="push" id="push" class="scroll-mt-20">
          <div class="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 space-y-5">
            <div class="flex items-center gap-3">
              <span class="badge badge-primary text-[10px] font-bold uppercase tracking-widest py-2 px-3">★ Endpoint Utama</span>
            </div>
            <div class="docs-endpoint-header !border-primary/20 !bg-primary/5">
              <span class="badge badge-primary font-mono font-bold px-2">POST</span>
              <code class="docs-endpoint-path text-primary">/api/integrations/:id/push</code>
              <span class="badge badge-primary badge-outline badge-sm ml-auto shrink-0">API Key / admin+</span>
            </div>
            <p class="text-sm text-base-content/75 leading-relaxed">
              <strong>Kirim satu entity dari sistem eksternal ke workspace ini.</strong>
              Untuk <code class="docs-code">sourceEntityType</code> bernilai <code class="docs-code">task</code>, <code class="docs-code">feature</code>, atau <code class="docs-code">bug</code> —
              endpoint ini langsung <strong>membuat atau memperbarui record nyata</strong> di modul project workspace.
              Untuk tipe custom lainnya, data disimpan di tabel staging <code class="docs-code">external_records</code>.
              Dedup otomatis berdasarkan <code class="docs-code">sourceId</code> + <code class="docs-code">connectionId</code> + <code class="docs-code">sourceEntityType</code> — aman dipanggil setiap ada perubahan.
            </p>
            <div class="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-base-content/70">
              <span class="text-primary">🔑</span>
              Autentikasi: <code class="docs-code-sm">Authorization: Bearer &lt;api_key&gt;</code> (disarankan untuk sistem eksternal) atau session cookie.
            </div>

            <!-- Main fields table -->
            <div class="rounded-lg border border-base-300 bg-base-100 overflow-hidden">
              <div class="bg-base-200/60 px-3 py-1.5 text-xs font-semibold text-base-content/50 uppercase tracking-widest">Request Body</div>
              <table class="table table-xs">
                <thead class="bg-base-200/40"><tr><th>Field</th><th>Tipe</th><th>Wajib</th><th>Keterangan</th></tr></thead>
                <tbody>
                  <tr class="bg-primary/3">
                    <td class="font-mono font-semibold">sourceId</td><td>string</td><td><span class="text-error font-bold">Ya</span></td><td>ID unik di sistem sumber (e.g. <code class="docs-code-sm">TASK-42</code>, <code class="docs-code-sm">BUG-7</code>)</td>
                  </tr>
                  <tr class="bg-primary/3">
                    <td class="font-mono font-semibold">sourceEntityType</td><td>string</td><td><span class="text-error font-bold">Ya</span></td>
                    <td>
                      <code class="docs-code-sm">task</code> · <code class="docs-code-sm">feature</code> · <code class="docs-code-sm">bug</code> → sync ke modul project<br>
                      <span class="text-base-content/50">Nilai lain (e.g. <code class="docs-code-sm">cms_post</code>) → staging saja</span>
                    </td>
                  </tr>
                  <tr class="bg-primary/3">
                    <td class="font-mono font-semibold">sourcePayload</td><td>object</td><td><span class="text-error font-bold">Ya*</span></td><td>Payload dari sumber — field-field di bawah dipetakan otomatis ke workspace<br><span class="text-base-content/40">*Wajib untuk task/feature/bug</span></td>
                  </tr>
                  <tr><td class="font-mono">projectId</td><td>uuid</td><td><span class="text-base-content/40">Tidak</span></td><td>UUID project tujuan (default: project dari koneksi)</td></tr>
                  <tr><td class="font-mono">sourceStatus</td><td>string</td><td><span class="text-base-content/40">Tidak</span></td><td>Status di sumber — akan dipetakan ke enum OCS jika cocok</td></tr>
                </tbody>
              </table>
            </div>

            <!-- sourcePayload fields per entity type -->
            <div class="space-y-3">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Field <code class="docs-code-sm normal-case">sourcePayload</code> per Tipe Entity</p>
              <div class="grid gap-3 md:grid-cols-3">
                <!-- task -->
                <div class="rounded-lg border border-base-300 p-3 space-y-2">
                  <p class="text-xs font-bold text-base-content flex items-center gap-1.5"><span class="badge badge-ghost badge-sm">task</span></p>
                  <table class="table table-xs w-full">
                    <thead><tr><th>Field</th><th>Keterangan</th></tr></thead>
                    <tbody>
                      <tr><td class="font-mono font-semibold text-xs">title</td><td class="text-xs">Wajib</td></tr>
                      <tr><td class="font-mono text-xs">description</td><td class="text-xs">Opsional</td></tr>
                      <tr><td class="font-mono text-xs">status</td><td class="text-xs">todo · in-progress · blocked · review · done</td></tr>
                      <tr><td class="font-mono text-xs">priority</td><td class="text-xs">low · medium · high · critical</td></tr>
                      <tr><td class="font-mono text-xs">dueDate</td><td class="text-xs">YYYY-MM-DD</td></tr>
                      <tr><td class="font-mono text-xs">featureId</td><td class="text-xs">UUID feature di OCS (opsional)</td></tr>
                    </tbody>
                  </table>
                </div>
                <!-- feature -->
                <div class="rounded-lg border border-base-300 p-3 space-y-2">
                  <p class="text-xs font-bold text-base-content flex items-center gap-1.5"><span class="badge badge-ghost badge-sm">feature</span></p>
                  <table class="table table-xs w-full">
                    <thead><tr><th>Field</th><th>Keterangan</th></tr></thead>
                    <tbody>
                      <tr><td class="font-mono font-semibold text-xs">title</td><td class="text-xs">Wajib</td></tr>
                      <tr><td class="font-mono text-xs">description</td><td class="text-xs">Opsional</td></tr>
                      <tr><td class="font-mono text-xs">status</td><td class="text-xs">backlog · planned · in-progress · blocked · done · cancelled</td></tr>
                      <tr><td class="font-mono text-xs">priority</td><td class="text-xs">low · medium · high · critical</td></tr>
                      <tr><td class="font-mono text-xs">targetRelease</td><td class="text-xs">String versi (e.g. "v2.1")</td></tr>
                      <tr><td class="font-mono text-xs">businessValue</td><td class="text-xs">Teks bebas</td></tr>
                    </tbody>
                  </table>
                </div>
                <!-- bug -->
                <div class="rounded-lg border border-base-300 p-3 space-y-2">
                  <p class="text-xs font-bold text-base-content flex items-center gap-1.5"><span class="badge badge-ghost badge-sm">bug</span></p>
                  <table class="table table-xs w-full">
                    <thead><tr><th>Field</th><th>Keterangan</th></tr></thead>
                    <tbody>
                      <tr><td class="font-mono font-semibold text-xs">title</td><td class="text-xs">Wajib</td></tr>
                      <tr><td class="font-mono text-xs">description</td><td class="text-xs">Opsional</td></tr>
                      <tr><td class="font-mono text-xs">status</td><td class="text-xs">open · in-progress · resolved · verified · closed</td></tr>
                      <tr><td class="font-mono text-xs">severity</td><td class="text-xs">low · medium · high · critical</td></tr>
                      <tr><td class="font-mono text-xs">priority</td><td class="text-xs">low · medium · high · critical</td></tr>
                      <tr><td class="font-mono text-xs">dueDate</td><td class="text-xs">YYYY-MM-DD</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p class="text-xs text-base-content/50">Status dan priority dipetakan otomatis — nilai seperti <code class="docs-code-sm">wip</code>, <code class="docs-code-sm">fixed</code>, <code class="docs-code-sm">urgent</code>, <code class="docs-code-sm">blocker</code> dll. dikenali dan dikonversi ke enum OCS yang paling sesuai.</p>
            </div>

            <!-- Bug example -->
            <div class="docs-code-block overflow-hidden rounded-lg">
              <div class="docs-code-header">
                <span>Sync bug dari sistem eksternal</span>
                <button class="docs-copy-btn" @click="copy('push-bug', pushBugExample)">{{ copied === 'push-bug' ? '✓ Copied' : 'Copy' }}</button>
              </div>
              <div class="mockup-code text-xs rounded-none !bg-neutral">
                <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/push \</code></pre>
                <pre data-prefix=" "><code>  -H "Content-Type: application/json" \</code></pre>
                <pre data-prefix=" "><code>  -H "Authorization: Bearer ocs_YOUR_API_KEY" \</code></pre>
                <pre data-prefix=" "><code>  -d '{</code></pre>
                <pre data-prefix=" "><code>    "sourceId": "BUG-101",</code></pre>
                <pre data-prefix=" "><code>    "sourceEntityType": "bug",</code></pre>
                <pre data-prefix=" "><code>    "projectId": "PROJECT_UUID",</code></pre>
                <pre data-prefix=" "><code>    "sourcePayload": {</code></pre>
                <pre data-prefix=" "><code>      "title": "Login crash on Safari",</code></pre>
                <pre data-prefix=" "><code>      "description": "Crash on iOS Safari 17 when clicking login",</code></pre>
                <pre data-prefix=" "><code>      "severity": "high",</code></pre>
                <pre data-prefix=" "><code>      "priority": "critical",</code></pre>
                <pre data-prefix=" "><code>      "status": "open"</code></pre>
                <pre data-prefix=" "><code>    }</code></pre>
                <pre data-prefix=" "><code>  }'</code></pre>
              </div>
              <div class="docs-code-response">
                <pre class="text-xs text-success/80 font-mono">&#8594;  { "record": { "sourceId": "BUG-101", ... }, "action": "created", "mappedEntityType": "bug", "mappedEntityId": "uuid" }</pre>
              </div>
            </div>

            <!-- Task example -->
            <div class="docs-code-block overflow-hidden rounded-lg">
              <div class="docs-code-header">
                <span>Sync task (update status)</span>
                <button class="docs-copy-btn" @click="copy('push-task', pushTaskExample)">{{ copied === 'push-task' ? '✓ Copied' : 'Copy' }}</button>
              </div>
              <div class="mockup-code text-xs rounded-none !bg-neutral">
                <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/push \</code></pre>
                <pre data-prefix=" "><code>  -H "Content-Type: application/json" \</code></pre>
                <pre data-prefix=" "><code>  -H "Authorization: Bearer ocs_YOUR_API_KEY" \</code></pre>
                <pre data-prefix=" "><code>  -d '{</code></pre>
                <pre data-prefix=" "><code>    "sourceId": "TASK-55",</code></pre>
                <pre data-prefix=" "><code>    "sourceEntityType": "task",</code></pre>
                <pre data-prefix=" "><code>    "projectId": "PROJECT_UUID",</code></pre>
                <pre data-prefix=" "><code>    "sourcePayload": {</code></pre>
                <pre data-prefix=" "><code>      "title": "Build dark mode toggle",</code></pre>
                <pre data-prefix=" "><code>      "status": "in-progress",</code></pre>
                <pre data-prefix=" "><code>      "priority": "high",</code></pre>
                <pre data-prefix=" "><code>      "dueDate": "2026-04-01"</code></pre>
                <pre data-prefix=" "><code>    }</code></pre>
                <pre data-prefix=" "><code>  }'</code></pre>
              </div>
              <div class="docs-code-response">
                <pre class="text-xs text-warning/80 font-mono">&#8594;  { "record": { ... }, "action": "updated", "mappedEntityType": "task", "mappedEntityId": "uuid" }  <span class="opacity-60">// jika sourceId sudah ada</span></pre>
              </div>
            </div>

            <!-- Feature example -->
            <div class="docs-code-block overflow-hidden rounded-lg">
              <div class="docs-code-header">
                <span>Sync feature dari backlog lokal</span>
                <button class="docs-copy-btn" @click="copy('push-feature', pushFeatureExample)">{{ copied === 'push-feature' ? '✓ Copied' : 'Copy' }}</button>
              </div>
              <div class="mockup-code text-xs rounded-none !bg-neutral">
                <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/push \</code></pre>
                <pre data-prefix=" "><code>  -H "Content-Type: application/json" \</code></pre>
                <pre data-prefix=" "><code>  -H "Authorization: Bearer ocs_YOUR_API_KEY" \</code></pre>
                <pre data-prefix=" "><code>  -d '{</code></pre>
                <pre data-prefix=" "><code>    "sourceId": "FEAT-12",</code></pre>
                <pre data-prefix=" "><code>    "sourceEntityType": "feature",</code></pre>
                <pre data-prefix=" "><code>    "projectId": "PROJECT_UUID",</code></pre>
                <pre data-prefix=" "><code>    "sourcePayload": {</code></pre>
                <pre data-prefix=" "><code>      "title": "Export to PDF",</code></pre>
                <pre data-prefix=" "><code>      "status": "planned",</code></pre>
                <pre data-prefix=" "><code>      "priority": "medium",</code></pre>
                <pre data-prefix=" "><code>      "targetRelease": "v2.3",</code></pre>
                <pre data-prefix=" "><code>      "businessValue": "Requested by 20+ enterprise customers"</code></pre>
                <pre data-prefix=" "><code>    }</code></pre>
                <pre data-prefix=" "><code>  }'</code></pre>
              </div>
              <div class="docs-code-response">
                <pre class="text-xs text-success/80 font-mono">&#8594;  { "record": { ... }, "action": "created", "mappedEntityType": "feature", "mappedEntityId": "uuid" }</pre>
              </div>
            </div>
          </div>
        </section>

        <!-- ── SYNC JOBS ───────────────────────────────────────── -->
        <section data-section="sync" id="sync" class="scroll-mt-20">
          <div class="docs-endpoint-header">
            <span class="badge badge-primary font-mono font-bold px-2">POST</span>
            <code class="docs-endpoint-path">/api/integrations/:id/sync</code>
            <span class="badge badge-outline badge-sm ml-auto shrink-0">admin+</span>
          </div>
          <p class="docs-desc mt-3">
            Antrekan sync job untuk koneksi ini. Job disimpan dengan status <code class="docs-code">queued</code> dan dapat diproses oleh worker atau cron eksternal.
            Gunakan untuk sinkronisasi batch terjadwal; gunakan <code class="docs-code">/push</code> untuk real-time.
          </p>
          <div class="docs-code-block mt-4">
            <div class="docs-code-header">
              <span>Request</span>
              <button class="docs-copy-btn" @click="copy('sync', syncExample)">{{ copied === 'sync' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/sync \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" -b cookies.txt \</code></pre>
              <pre data-prefix=" "><code>  -d '{"jobType": "full_sync"}'</code></pre>
            </div>
            <div class="docs-code-response">
              <pre class="text-xs text-success/80 font-mono">&#8594;  { "id": "JOB_UUID", "status": "queued", "jobType": "full_sync", ... }</pre>
            </div>
          </div>
          <div class="mt-5 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-base-content/40">Lifecycle Status Job</p>
            <div class="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
              <span class="badge badge-info badge-sm">queued</span> <span>&#8594;</span>
              <span class="badge badge-primary badge-sm">running</span> <span>&#8594;</span>
              <span class="badge badge-success badge-sm">succeeded</span>
              <span class="text-base-content/30 mx-1">|</span>
              <span class="badge badge-warning badge-sm">partial</span>
              <span class="text-base-content/30 mx-1">|</span>
              <span class="badge badge-error badge-sm">failed</span>
            </div>
          </div>
        </section>

        <!-- ── QUICKSTART ──────────────────────────────────────── -->
        <section data-section="quickstart" id="quickstart" class="scroll-mt-20">
          <div class="docs-section-label">Panduan</div>
          <h2 class="docs-h2">Quickstart: Integrasi CMS ke Workspace</h2>
          <p class="docs-desc">Setup sekali, lalu panggil <code class="docs-code">/push</code> kapanpun ada data baru di sistem Anda. Untuk <code class="docs-code">task</code>, <code class="docs-code">feature</code>, dan <code class="docs-code">bug</code> — record langsung dibuat/diperbarui di modul project.</p>
          <div class="docs-code-block mt-5">
            <div class="docs-code-header">
              <span>Setup lengkap + runtime (copy semua)</span>
              <button class="docs-copy-btn" @click="copy('quickstart', quickstartExample)">{{ copied === 'quickstart' ? '✓ Copied' : 'Copy' }}</button>
            </div>
            <div class="mockup-code text-xs rounded-none !bg-neutral">
              <pre data-prefix=" " class="opacity-40"><code>## STEP 1: Login ##</code></pre>
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/auth/login \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" \</code></pre>
              <pre data-prefix=" "><code>  -d '{"email":"admin@your-workspace.com","password":"xxxx"}' \</code></pre>
              <pre data-prefix=" "><code>  -c cookies.txt</code></pre>
              <pre data-prefix=""><code></code></pre>
              <pre data-prefix=" " class="opacity-40"><code>## STEP 2: Daftarkan CMS sebagai koneksi (sekali saja) ##</code></pre>
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" -b cookies.txt \</code></pre>
              <pre data-prefix=" "><code>  -d '{"name":"My CMS","providerType":"rest_api","projectId":"PROJ_UUID"}'</code></pre>
              <pre data-prefix=" "><code class="text-success opacity-70">  # Simpan "id" dari response sebagai CONNECTION_UUID</code></pre>
              <pre data-prefix=""><code></code></pre>
              <pre data-prefix=" " class="opacity-40"><code>## STEP 3: Definisikan field mapping (opsional) ##</code></pre>
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/mappings \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" -b cookies.txt \</code></pre>
              <pre data-prefix=" "><code>  -d '{"sourceField":"cms_title","targetField":"title"}'</code></pre>
              <pre data-prefix=""><code></code></pre>
              <pre data-prefix=" " class="opacity-40"><code>## RUNTIME: Push menggunakan API key (bukan session) ##</code></pre>
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/push \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" \</code></pre>
              <pre data-prefix=" "><code>  -H "Authorization: Bearer ocs_YOUR_API_KEY" \</code></pre>
              <pre data-prefix=" "><code>  -d '{"sourceId":"BUG-42","sourceEntityType":"bug","projectId":"PROJ_UUID","sourcePayload":{"title":"Crash on login","severity":"high","status":"open"}}'</code></pre>
              <pre data-prefix=""><code></code></pre>
              <pre data-prefix="$"><code>curl -X POST {{ origin }}/api/integrations/CONNECTION_UUID/push \</code></pre>
              <pre data-prefix=" "><code>  -H "Content-Type: application/json" \</code></pre>
              <pre data-prefix=" "><code>  -H "Authorization: Bearer ocs_YOUR_API_KEY" \</code></pre>
              <pre data-prefix=" "><code>  -d '{"sourceId":"TASK-7","sourceEntityType":"task","projectId":"PROJ_UUID","sourcePayload":{"title":"Build X","status":"in-progress"}}'</code></pre>
              <pre data-prefix=""><code></code></pre>
              <pre data-prefix=" " class="opacity-40"><code>## Cek status koneksi (gunakan session) ##</code></pre>
              <pre data-prefix="$"><code>curl {{ origin }}/api/integrations/CONNECTION_UUID -b cookies.txt</code></pre>
              <pre data-prefix=" "><code class="text-success opacity-70">  # &#8594; { connection, mappings, syncJobs, records: [...] }</code></pre>
            </div>
          </div>
        </section>

        <!-- ── CLIENT APP GUIDE ─────────────────────────────── -->
        <section data-section="client-guide" id="client-guide" class="scroll-mt-20">
          <div class="docs-section-label">Panduan</div>
          <h2 class="docs-h2">Panduan Client App</h2>
          <p class="docs-desc">
            Bagian ini menjelaskan apa yang perlu dibangun di sisi aplikasi Anda (CMS, sistem internal, SQLite lokal, dll.)
            agar data dapat tersync ke OCS Workspace secara otomatis.
          </p>

          <!-- Checklist kebutuhan -->
          <div class="mt-6 rounded-xl border border-base-300 bg-base-100 overflow-hidden">
            <div class="bg-base-200/60 px-4 py-2.5">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Yang Harus Ada di Sisi Client</p>
            </div>
            <div class="divide-y divide-base-200">
              <div class="flex items-start gap-3 px-4 py-3">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                <div>
                  <p class="text-sm font-semibold text-base-content">Konfigurasi koneksi</p>
                  <p class="text-xs text-base-content/60 mt-0.5">Simpan <code class="docs-code-sm">OCS_URL</code>, <code class="docs-code-sm">OCS_API_KEY</code>, <code class="docs-code-sm">OCS_CONNECTION_ID</code>, dan <code class="docs-code-sm">OCS_PROJECT_ID</code> di environment variable atau config file. Jangan hardcode ke source code.</p>
                </div>
              </div>
              <div class="flex items-start gap-3 px-4 py-3">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                <div>
                  <p class="text-sm font-semibold text-base-content">Kolom tracking di tabel lokal</p>
                  <p class="text-xs text-base-content/60 mt-0.5">Tambahkan kolom <code class="docs-code-sm">ocs_synced_at</code> (timestamp) dan <code class="docs-code-sm">ocs_entity_id</code> (text) ke tabel tasks, features, bugs di database lokal Anda. Ini memungkinkan sync inkremental dan linking balik ke OCS.</p>
                </div>
              </div>
              <div class="flex items-start gap-3 px-4 py-3">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                <div>
                  <p class="text-sm font-semibold text-base-content">Sync agent / worker</p>
                  <p class="text-xs text-base-content/60 mt-0.5">Loop atau event handler yang membaca record yang berubah, lalu memanggil <code class="docs-code-sm">/push</code> untuk setiap perubahan. Bisa dijalankan real-time (after-write hook), scheduled (cron/interval), atau on-demand.</p>
                </div>
              </div>
              <div class="flex items-start gap-3 px-4 py-3">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">4</span>
                <div>
                  <p class="text-sm font-semibold text-base-content">Simpan <code class="docs-code-sm">mappedEntityId</code> dari response</p>
                  <p class="text-xs text-base-content/60 mt-0.5">Response <code class="docs-code-sm">/push</code> mengembalikan <code class="docs-code-sm">mappedEntityId</code> — UUID entity di OCS. Simpan ini ke kolom <code class="docs-code-sm">ocs_entity_id</code> di DB lokal agar push selanjutnya dengan <code class="docs-code-sm">sourceId</code> yang sama otomatis update (bukan buat baru).</p>
                </div>
              </div>
              <div class="flex items-start gap-3 px-4 py-3">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">5</span>
                <div>
                  <p class="text-sm font-semibold text-base-content">Error handling dan retry</p>
                  <p class="text-xs text-base-content/60 mt-0.5">Tangani status 401 (API key expired/invalid), 422 (validasi gagal), 5xx (server error). Untuk error sementara: retry dengan exponential backoff. Untuk 422: log payload ke file untuk review manual.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Schema lokal -->
          <div class="mt-8 space-y-3">
            <h3 class="text-base font-bold tracking-tight">Schema DB Lokal yang Direkomendasikan</h3>
            <p class="docs-desc">Tambahkan kolom ini ke tabel yang ada di database lokal Anda (SQLite, PostgreSQL, MySQL, dll.):</p>
            <div class="docs-code-block">
              <div class="docs-code-header">
                <span>SQLite — ALTER TABLE untuk tambah kolom tracking OCS</span>
                <button class="docs-copy-btn" @click="copy('schema-sql', schemaSqlExample)">{{ copied === 'schema-sql' ? '✓ Copied' : 'Copy' }}</button>
              </div>
              <div class="mockup-code text-xs rounded-none !bg-neutral">
                <pre data-prefix=""><code class="text-base-content/40">-- Jalankan sekali saat setup integrasi</code></pre>
                <pre data-prefix=""><code>ALTER TABLE tasks    ADD COLUMN ocs_synced_at TEXT;</code></pre>
                <pre data-prefix=""><code>ALTER TABLE tasks    ADD COLUMN ocs_entity_id TEXT;</code></pre>
                <pre data-prefix=""><code>ALTER TABLE features ADD COLUMN ocs_synced_at TEXT;</code></pre>
                <pre data-prefix=""><code>ALTER TABLE features ADD COLUMN ocs_entity_id TEXT;</code></pre>
                <pre data-prefix=""><code>ALTER TABLE bugs     ADD COLUMN ocs_synced_at TEXT;</code></pre>
                <pre data-prefix=""><code>ALTER TABLE bugs     ADD COLUMN ocs_entity_id TEXT;</code></pre>
              </div>
            </div>
          </div>

          <!-- Sync agent Python -->
          <div class="mt-8 space-y-3">
            <h3 class="text-base font-bold tracking-tight">Sync Agent — Python (SQLite)</h3>
            <p class="docs-desc">Contoh sync agent minimal yang membaca record yang belum di-sync dan mengirimnya ke OCS. Simpan sebagai <code class="docs-code">ocs_sync.py</code>.</p>
            <div class="rounded-lg border border-info/30 bg-info/6 px-4 py-3 text-xs text-base-content/70 space-y-1">
              <p><strong>Field yang dipetakan otomatis oleh OCS:</strong></p>
              <p>Cukup kirim field seperti yang ada di schema lokal Anda. OCS akan memetakan nilai status/priority secara otomatis — tidak perlu konversi manual.</p>
            </div>
            <div class="docs-code-block">
              <div class="docs-code-header">
                <span>ocs_sync.py — sync agent (Python 3, stdlib only)</span>
                <button class="docs-copy-btn" @click="copy('client-python', clientPythonExample)">{{ copied === 'client-python' ? '✓ Copied' : 'Copy' }}</button>
              </div>
              <div class="mockup-code text-xs rounded-none !bg-neutral leading-relaxed">
                <pre data-prefix=""><code class="text-base-content/40"># ocs_sync.py — kirim task/feature/bug ke OCS Workspace</code></pre>
                <pre data-prefix=""><code>import os, sqlite3, json, urllib.request, urllib.error</code></pre>
                <pre data-prefix=""><code>from datetime import datetime, timezone</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>OCS_URL        = os.environ["OCS_URL"]           <span class="opacity-50"># https://your-workspace.example.com</span></code></pre>
                <pre data-prefix=""><code>OCS_API_KEY    = os.environ["OCS_API_KEY"]       <span class="opacity-50"># ocs_xxxx...</span></code></pre>
                <pre data-prefix=""><code>OCS_CONN_ID    = os.environ["OCS_CONNECTION_ID"]</code></pre>
                <pre data-prefix=""><code>OCS_PROJECT_ID = os.environ["OCS_PROJECT_ID"]</code></pre>
                <pre data-prefix=""><code>DB_PATH        = os.environ.get("DB_PATH", "app.db")</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>def push(source_id, entity_type, payload):</code></pre>
                <pre data-prefix=""><code>    url  = f"{OCS_URL}/api/integrations/{OCS_CONN_ID}/push"</code></pre>
                <pre data-prefix=""><code>    body = json.dumps({</code></pre>
                <pre data-prefix=""><code>        "sourceId":         source_id,</code></pre>
                <pre data-prefix=""><code>        "sourceEntityType": entity_type,</code></pre>
                <pre data-prefix=""><code>        "projectId":        OCS_PROJECT_ID,</code></pre>
                <pre data-prefix=""><code>        "sourcePayload":    payload,</code></pre>
                <pre data-prefix=""><code>    }).encode()</code></pre>
                <pre data-prefix=""><code>    req = urllib.request.Request(url, data=body, method="POST", headers={</code></pre>
                <pre data-prefix=""><code>        "Content-Type":  "application/json",</code></pre>
                <pre data-prefix=""><code>        "Authorization": f"Bearer {OCS_API_KEY}",</code></pre>
                <pre data-prefix=""><code>    })</code></pre>
                <pre data-prefix=""><code>    with urllib.request.urlopen(req) as res:</code></pre>
                <pre data-prefix=""><code>        return json.load(res)</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>def sync_table(conn, table, entity_type, fields):</code></pre>
                <pre data-prefix=""><code>    cols = ", ".join(fields)</code></pre>
                <pre data-prefix=""><code>    rows = conn.execute(</code></pre>
                <pre data-prefix=""><code>        f"SELECT id, {cols} FROM {table} WHERE ocs_synced_at IS NULL"</code></pre>
                <pre data-prefix=""><code>        f" OR updated_at &gt; ocs_synced_at"</code></pre>
                <pre data-prefix=""><code>    ).fetchall()</code></pre>
                <pre data-prefix=""><code>    col_names = ["id"] + fields</code></pre>
                <pre data-prefix=""><code>    for row in rows:</code></pre>
                <pre data-prefix=""><code>        rec = dict(zip(col_names, row))</code></pre>
                <pre data-prefix=""><code>        source_id = f"{entity_type.upper()}-{rec['id']}"</code></pre>
                <pre data-prefix=""><code>        try:</code></pre>
                <pre data-prefix=""><code>            res = push(source_id, entity_type, rec)</code></pre>
                <pre data-prefix=""><code>            now = datetime.now(timezone.utc).isoformat()</code></pre>
                <pre data-prefix=""><code>            conn.execute(</code></pre>
                <pre data-prefix=""><code>                f"UPDATE {table} SET ocs_synced_at=?, ocs_entity_id=? WHERE id=?",</code></pre>
                <pre data-prefix=""><code>                (now, res.get("mappedEntityId"), rec["id"]),</code></pre>
                <pre data-prefix=""><code>            )</code></pre>
                <pre data-prefix=""><code>            print(f"  {source_id} → {res['action']} ({res.get('mappedEntityId', '-')})")</code></pre>
                <pre data-prefix=""><code>        except urllib.error.HTTPError as e:</code></pre>
                <pre data-prefix=""><code>            print(f"  ERROR {source_id}: HTTP {e.code} — {e.read().decode()}")</code></pre>
                <pre data-prefix=""><code>    conn.commit()</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>def main():</code></pre>
                <pre data-prefix=""><code>    conn = sqlite3.connect(DB_PATH)</code></pre>
                <pre data-prefix=""><code>    print("[OCS Sync] Syncing tasks...")</code></pre>
                <pre data-prefix=""><code>    sync_table(conn, "tasks",    "task",    ["title", "description", "status", "priority", "due_date"])</code></pre>
                <pre data-prefix=""><code>    print("[OCS Sync] Syncing features...")</code></pre>
                <pre data-prefix=""><code>    sync_table(conn, "features", "feature", ["title", "description", "status", "priority"])</code></pre>
                <pre data-prefix=""><code>    print("[OCS Sync] Syncing bugs...")</code></pre>
                <pre data-prefix=""><code>    sync_table(conn, "bugs",     "bug",     ["title", "description", "status", "severity", "priority"])</code></pre>
                <pre data-prefix=""><code>    conn.close()</code></pre>
                <pre data-prefix=""><code>    print("[OCS Sync] Done.")</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>if __name__ == "__main__":</code></pre>
                <pre data-prefix=""><code>    main()</code></pre>
              </div>
            </div>
          </div>

          <!-- Node.js version -->
          <div class="mt-8 space-y-3">
            <h3 class="text-base font-bold tracking-tight">Sync Agent — Node.js (better-sqlite3)</h3>
            <div class="docs-code-block">
              <div class="docs-code-header">
                <span>ocs-sync.mjs — sync agent (Node.js ESM)</span>
                <button class="docs-copy-btn" @click="copy('client-node', clientNodeExample)">{{ copied === 'client-node' ? '✓ Copied' : 'Copy' }}</button>
              </div>
              <div class="mockup-code text-xs rounded-none !bg-neutral leading-relaxed">
                <pre data-prefix=""><code class="text-base-content/40">// npm install better-sqlite3</code></pre>
                <pre data-prefix=""><code>import Database from 'better-sqlite3'</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>const OCS_URL     = process.env.OCS_URL</code></pre>
                <pre data-prefix=""><code>const API_KEY     = process.env.OCS_API_KEY</code></pre>
                <pre data-prefix=""><code>const CONN_ID     = process.env.OCS_CONNECTION_ID</code></pre>
                <pre data-prefix=""><code>const PROJECT_ID  = process.env.OCS_PROJECT_ID</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>async function push(sourceId, entityType, payload) {</code></pre>
                <pre data-prefix=""><code>  const res = await fetch(`${OCS_URL}/api/integrations/${CONN_ID}/push`, {</code></pre>
                <pre data-prefix=""><code>    method: 'POST',</code></pre>
                <pre data-prefix=""><code>    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },</code></pre>
                <pre data-prefix=""><code>    body: JSON.stringify({ sourceId, sourceEntityType: entityType, projectId: PROJECT_ID, sourcePayload: payload }),</code></pre>
                <pre data-prefix=""><code>  })</code></pre>
                <pre data-prefix=""><code>  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)</code></pre>
                <pre data-prefix=""><code>  return res.json()</code></pre>
                <pre data-prefix=""><code>}</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>async function syncTable(db, table, entityType, fields) {</code></pre>
                <pre data-prefix=""><code>  const rows = db.prepare(</code></pre>
                <pre data-prefix=""><code>    `SELECT id, ${fields} FROM ${table}</code></pre>
                <pre data-prefix=""><code>     WHERE ocs_synced_at IS NULL OR updated_at &gt; ocs_synced_at`</code></pre>
                <pre data-prefix=""><code>  ).all()</code></pre>
                <pre data-prefix=""><code>  for (const row of rows) {</code></pre>
                <pre data-prefix=""><code>    const sourceId = `${entityType.toUpperCase()}-${row.id}`</code></pre>
                <pre data-prefix=""><code>    try {</code></pre>
                <pre data-prefix=""><code>      const result = await push(sourceId, entityType, row)</code></pre>
                <pre data-prefix=""><code>      db.prepare(`UPDATE ${table} SET ocs_synced_at=?, ocs_entity_id=? WHERE id=?`)</code></pre>
                <pre data-prefix=""><code>        .run(new Date().toISOString(), result.mappedEntityId, row.id)</code></pre>
                <pre data-prefix=""><code>      console.log(`  ${sourceId} → ${result.action} (${result.mappedEntityId ?? '-'})`)</code></pre>
                <pre data-prefix=""><code>    } catch (err) { console.error(`  ERROR ${sourceId}:`, err.message) }</code></pre>
                <pre data-prefix=""><code>  }</code></pre>
                <pre data-prefix=""><code>}</code></pre>
                <pre data-prefix=""><code></code></pre>
                <pre data-prefix=""><code>const db = new Database(process.env.DB_PATH ?? 'app.db')</code></pre>
                <pre data-prefix=""><code>await syncTable(db, 'tasks',    'task',    'title, description, status, priority, due_date')</code></pre>
                <pre data-prefix=""><code>await syncTable(db, 'features', 'feature', 'title, description, status, priority')</code></pre>
                <pre data-prefix=""><code>await syncTable(db, 'bugs',     'bug',     'title, description, status, severity, priority')</code></pre>
                <pre data-prefix=""><code>db.close()</code></pre>
              </div>
            </div>
          </div>

          <!-- Pola trigger -->
          <div class="mt-8 space-y-3">
            <h3 class="text-base font-bold tracking-tight">Pola Trigger yang Direkomendasikan</h3>
            <div class="grid gap-3 md:grid-cols-3">
              <div class="rounded-lg border border-base-300 p-4 space-y-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-success badge-sm">Real-time</span>
                  <span class="text-xs text-base-content/50">Disarankan</span>
                </div>
                <p class="text-xs font-semibold">After-write hook</p>
                <p class="text-xs text-base-content/60">Panggil <code class="docs-code-sm">/push</code> langsung setelah INSERT atau UPDATE di DB lokal. Cocok untuk aplikasi dengan event system atau ORM hooks (e.g. SQLAlchemy <code class="docs-code-sm">after_flush</code>, Prisma middleware).</p>
                <div class="rounded bg-base-200/60 px-2 py-1 font-mono text-[10px] text-base-content/50">Latency: &lt; 1 detik</div>
              </div>
              <div class="rounded-lg border border-base-300 p-4 space-y-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-warning badge-sm">Scheduled</span>
                </div>
                <p class="text-xs font-semibold">Cron / interval</p>
                <p class="text-xs text-base-content/60">Jalankan sync agent secara berkala (setiap 1-5 menit). Query record yang <code class="docs-code-sm">updated_at &gt; ocs_synced_at</code>. Paling mudah diimplementasikan, cocok untuk batch data.</p>
                <div class="rounded bg-base-200/60 px-2 py-1 font-mono text-[10px] text-base-content/50">Latency: 1–5 menit</div>
              </div>
              <div class="rounded-lg border border-base-300 p-4 space-y-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-info badge-sm">On-demand</span>
                </div>
                <p class="text-xs font-semibold">Manual / CLI</p>
                <p class="text-xs text-base-content/60">Jalankan script sync secara manual saat diperlukan. Berguna untuk initial import atau re-sync setelah downtime. Script di atas bisa langsung dipakai dengan cara ini.</p>
                <div class="rounded bg-base-200/60 px-2 py-1 font-mono text-[10px] text-base-content/50">Latency: manual</div>
              </div>
            </div>
          </div>

          <!-- Error handling -->
          <div class="mt-8 space-y-3">
            <h3 class="text-base font-bold tracking-tight">Error Handling</h3>
            <div class="rounded-lg border border-base-300 bg-base-100 overflow-hidden">
              <table class="table table-xs">
                <thead class="bg-base-200/60"><tr><th>HTTP Status</th><th>Penyebab</th><th>Yang Harus Dilakukan</th></tr></thead>
                <tbody>
                  <tr><td class="font-mono font-bold w-20">401</td><td>API key tidak valid atau sudah di-rotate</td><td>Ambil API key baru dari halaman koneksi di workspace (Rotate Key), update env var</td></tr>
                  <tr><td class="font-mono font-bold">403</td><td>API key tidak cocok dengan connection ID</td><td>Pastikan <code class="docs-code-sm">OCS_CONNECTION_ID</code> dan <code class="docs-code-sm">OCS_API_KEY</code> berasal dari koneksi yang sama</td></tr>
                  <tr><td class="font-mono font-bold">422</td><td>Field wajib kosong atau <code class="docs-code-sm">projectId</code> tidak diset</td><td>Pastikan <code class="docs-code-sm">title</code> ada di payload dan <code class="docs-code-sm">projectId</code> diset. Log record untuk review manual.</td></tr>
                  <tr><td class="font-mono font-bold">404</td><td>Connection ID tidak ditemukan (mungkin sudah dihapus)</td><td>Buat koneksi baru dari workspace dan update <code class="docs-code-sm">OCS_CONNECTION_ID</code></td></tr>
                  <tr><td class="font-mono font-bold">5xx</td><td>Server error sementara</td><td>Retry dengan exponential backoff (1s, 2s, 4s). Jangan update <code class="docs-code-sm">ocs_synced_at</code> sehingga record akan di-retry pada run berikutnya.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Env vars checklist -->
          <div class="mt-8">
            <h3 class="text-base font-bold tracking-tight mb-3">Environment Variables</h3>
            <div class="docs-code-block">
              <div class="docs-code-header">
                <span>.env — konfigurasi sync agent</span>
                <button class="docs-copy-btn" @click="copy('client-env', clientEnvExample)">{{ copied === 'client-env' ? '✓ Copied' : 'Copy' }}</button>
              </div>
              <div class="mockup-code text-xs rounded-none !bg-neutral">
                <pre data-prefix=""><code class="text-base-content/40"># Dapatkan nilai-nilai ini dari halaman detail koneksi di OCS Workspace</code></pre>
                <pre data-prefix=""><code>OCS_URL=https://your-workspace.example.com</code></pre>
                <pre data-prefix=""><code>OCS_API_KEY=ocs_xxxxxxxxxxxxxxxxxxxx</code></pre>
                <pre data-prefix=""><code>OCS_CONNECTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code></pre>
                <pre data-prefix=""><code>OCS_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code></pre>
                <pre data-prefix=""><code>DB_PATH=./app.db</code></pre>
              </div>
            </div>
            <div class="mt-3 rounded-lg border border-warning/30 bg-warning/6 px-4 py-3 text-xs text-base-content/70">
              <strong>Jangan commit <code class="docs-code-sm">.env</code> ke git.</strong> Tambahkan ke <code class="docs-code-sm">.gitignore</code>. API key memberikan akses tulis ke project — jaga kerahasiaannya.
              Jika key bocor, langsung rotate dari halaman koneksi di workspace.
            </div>
          </div>
        </section>

        <!-- ── WEBHOOK GUIDE ═══════════════════════════════════ -->
        <section data-section="webhook-guide" id="webhook-guide" class="scroll-mt-20">
          <div class="docs-section-label">Panduan</div>
          <h2 class="docs-h2">Webhook Write-back</h2>
          <p class="docs-lead">Secara default integrasi berjalan <strong>1 arah</strong>: client app push data ke OCS. Webhook membalikkan arah ini — OCS akan HTTP POST ke client kamu setiap kali status task, bug, atau feature berubah di workspace.</p>

          <div class="space-y-10 mt-8">

            <!-- How it works -->
            <div>
              <h3 class="text-base font-bold tracking-tight mb-3">Cara Kerja</h3>
              <div class="rounded-lg border border-base-300 overflow-hidden">
                <div class="bg-base-200/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-base-content/40">Alur</div>
                <ol class="divide-y divide-base-200 text-sm">
                  <li class="flex gap-3 px-4 py-3"><span class="shrink-0 font-bold text-primary">1.</span><span>User mengubah status task/bug/feature di OCS (via UI atau PATCH API).</span></li>
                  <li class="flex gap-3 px-4 py-3"><span class="shrink-0 font-bold text-primary">2.</span><span>OCS mencari semua <code class="docs-code-sm">external_records</code> yang memiliki <code class="docs-code-sm">mappedEntityId</code> = entitas tersebut.</span></li>
                  <li class="flex gap-3 px-4 py-3"><span class="shrink-0 font-bold text-primary">3.</span><span>Untuk setiap connection yang <code class="docs-code-sm">webhookEnabled = true</code>, OCS POST payload ke <code class="docs-code-sm">baseUrl + webhookPath</code>.</span></li>
                  <li class="flex gap-3 px-4 py-3"><span class="shrink-0 font-bold text-primary">4.</span><span>OCS mencatat hasil pengiriman (delivered / failed) di tabel <code class="docs-code-sm">integration_webhook_deliveries</code> — tampil di halaman detail koneksi.</span></li>
                  <li class="flex gap-3 px-4 py-3"><span class="shrink-0 font-bold text-primary">5.</span><span>Client app memproses payload dan update local DB-nya.</span></li>
                </ol>
              </div>
            </div>

            <!-- Enable webhook -->
            <div>
              <h3 class="text-base font-bold tracking-tight mb-3">Mengaktifkan Webhook</h3>
              <p class="text-sm text-base-content/70 mb-4">Buka halaman detail koneksi kamu, scroll ke card <strong>Webhook (Write-back)</strong> di sidebar kanan, lalu isi:</p>
              <div class="overflow-x-auto">
                <table class="docs-table">
                  <thead><tr><th>Field</th><th>Contoh</th><th>Keterangan</th></tr></thead>
                  <tbody>
                    <tr><td class="font-mono font-semibold">webhookEnabled</td><td>true</td><td>Toggle aktif/nonaktif pengiriman webhook</td></tr>
                    <tr><td class="font-mono font-semibold">webhookPath</td><td>/api/ocs-webhook</td><td>Path endpoint di client app kamu. Dipanggil ke <code class="docs-code-sm">baseUrl + webhookPath</code></td></tr>
                    <tr><td class="font-mono font-semibold">webhookSecret</td><td>my-secret-key</td><td>Opsional. Dipakai untuk menghitung HMAC signature di header <code class="docs-code-sm">X-OCS-Signature</code></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Payload format -->
            <div>
              <h3 class="text-base font-bold tracking-tight mb-3">Format Payload</h3>
              <p class="text-sm text-base-content/70 mb-3">OCS mengirim <code class="docs-code-sm">POST</code> dengan body JSON berikut:</p>
              <div class="mockup-code text-xs">
                <pre data-prefix=""><code>{</code></pre>
                <pre data-prefix=""><code>  "event":      "task.updated",</code></pre>
                <pre data-prefix=""><code>  "entityType": "task",</code></pre>
                <pre data-prefix=""><code>  "entityId":   "&lt;uuid entitas OCS&gt;",</code></pre>
                <pre data-prefix=""><code>  "timestamp":  "2026-03-23T10:00:00.000Z",</code></pre>
                <pre data-prefix=""><code>  "data": {</code></pre>
                <pre data-prefix=""><code>    "id":       "&lt;uuid&gt;",</code></pre>
                <pre data-prefix=""><code>    "title":    "Login crash on Safari",</code></pre>
                <pre data-prefix=""><code>    "status":   "in-progress",</code></pre>
                <pre data-prefix=""><code>    "priority": "critical"</code></pre>
                <pre data-prefix=""><code>  }</code></pre>
                <pre data-prefix=""><code>}</code></pre>
              </div>
              <div class="mt-3 overflow-x-auto">
                <table class="docs-table">
                  <thead><tr><th>Event</th><th>Kapan dikirim</th></tr></thead>
                  <tbody>
                    <tr><td class="font-mono">task.updated</td><td>PATCH pada task (status, priority, dll)</td></tr>
                    <tr><td class="font-mono">bug.updated</td><td>PATCH pada bug</td></tr>
                    <tr><td class="font-mono">feature.updated</td><td>PATCH pada feature</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Signature verification -->
            <div>
              <h3 class="text-base font-bold tracking-tight mb-3">Verifikasi Signature (Opsional)</h3>
              <p class="text-sm text-base-content/70 mb-3">Jika kamu set <code class="docs-code-sm">webhookSecret</code>, OCS menambahkan header:</p>
              <div class="mockup-code text-xs mb-4">
                <pre data-prefix=""><code>X-OCS-Signature: sha256=&lt;hmac-hex&gt;</code></pre>
              </div>
              <p class="text-sm text-base-content/70 mb-3">Cara verifikasi di sisi client:</p>
              <div class="mockup-code text-xs mb-2">
                <pre data-prefix=" "><code># Python</code></pre>
                <pre data-prefix=" "><code>import hmac, hashlib</code></pre>
                <pre data-prefix=" "><code></code></pre>
                <pre data-prefix=" "><code>def verify(body_bytes, secret, header):</code></pre>
                <pre data-prefix=" "><code>    expected = "sha256=" + hmac.new(</code></pre>
                <pre data-prefix=" "><code>        secret.encode(), body_bytes, hashlib.sha256</code></pre>
                <pre data-prefix=" "><code>    ).hexdigest()</code></pre>
                <pre data-prefix=" "><code>    return hmac.compare_digest(expected, header)</code></pre>
              </div>
              <div class="mockup-code text-xs">
                <pre data-prefix=" "><code>// Node.js</code></pre>
                <pre data-prefix=" "><code>const { createHmac, timingSafeEqual } = require('crypto')</code></pre>
                <pre data-prefix=" "><code></code></pre>
                <pre data-prefix=" "><code>function verify(bodyStr, secret, header) {</code></pre>
                <pre data-prefix=" "><code>  const expected = 'sha256=' +</code></pre>
                <pre data-prefix=" "><code>    createHmac('sha256', secret).update(bodyStr).digest('hex')</code></pre>
                <pre data-prefix=" "><code>  return timingSafeEqual(Buffer.from(expected), Buffer.from(header))</code></pre>
                <pre data-prefix=" "><code>}</code></pre>
              </div>
              <div role="alert" class="alert alert-soft alert-warning mt-3 py-2 text-xs">
                Selalu gunakan <strong>constant-time comparison</strong> (<code>hmac.compare_digest</code> / <code>timingSafeEqual</code>) untuk mencegah timing attack.
              </div>
            </div>

            <!-- Receiver endpoint examples -->
            <div>
              <h3 class="text-base font-bold tracking-tight mb-3">Contoh Endpoint Penerima</h3>

              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2">Python (Flask/FastAPI)</p>
              <div class="mockup-code text-xs mb-4">
                <pre data-prefix=" "><code>from flask import Flask, request, abort</code></pre>
                <pre data-prefix=" "><code>import hmac, hashlib, sqlite3</code></pre>
                <pre data-prefix=" "><code></code></pre>
                <pre data-prefix=" "><code>OCS_SECRET = os.environ.get("OCS_WEBHOOK_SECRET", "")</code></pre>
                <pre data-prefix=" "><code></code></pre>
                <pre data-prefix=" "><code>@app.route("/api/ocs-webhook", methods=["POST"])</code></pre>
                <pre data-prefix=" "><code>def ocs_webhook():</code></pre>
                <pre data-prefix=" "><code>    if OCS_SECRET:</code></pre>
                <pre data-prefix=" "><code>        sig = request.headers.get("X-OCS-Signature", "")</code></pre>
                <pre data-prefix=" "><code>        if not verify(request.data, OCS_SECRET, sig):</code></pre>
                <pre data-prefix=" "><code>            abort(401)</code></pre>
                <pre data-prefix=" "><code></code></pre>
                <pre data-prefix=" "><code>    payload = request.json</code></pre>
                <pre data-prefix=" "><code>    entity_id  = payload["entityId"]</code></pre>
                <pre data-prefix=" "><code>    new_status = payload["data"]["status"]</code></pre>
                <pre data-prefix=" "><code></code></pre>
                <pre data-prefix=" "><code>    db = sqlite3.connect("cms.db")</code></pre>
                <pre data-prefix=" "><code>    db.execute(</code></pre>
                <pre data-prefix=" "><code>        "UPDATE tasks SET status=? WHERE ocs_entity_id=?",</code></pre>
                <pre data-prefix=" "><code>        [new_status, entity_id]</code></pre>
                <pre data-prefix=" "><code>    )</code></pre>
                <pre data-prefix=" "><code>    db.commit()</code></pre>
                <pre data-prefix=" "><code>    return "", 200</code></pre>
              </div>

              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2">Node.js (Express)</p>
              <div class="mockup-code text-xs">
                <pre data-prefix=" "><code>import express from 'express'</code></pre>
                <pre data-prefix=" "><code>import Database from 'better-sqlite3'</code></pre>
                <pre data-prefix=" "><code>const db = new Database('cms.db')</code></pre>
                <pre data-prefix=" "><code></code></pre>
                <pre data-prefix=" "><code>app.post('/api/ocs-webhook', express.raw({ type: '*/*' }), (req, res) =&gt; {</code></pre>
                <pre data-prefix=" "><code>  const sig = req.headers['x-ocs-signature']</code></pre>
                <pre data-prefix=" "><code>  if (process.env.OCS_WEBHOOK_SECRET &amp;&amp; !verify(req.body, process.env.OCS_WEBHOOK_SECRET, sig)) {</code></pre>
                <pre data-prefix=" "><code>    return res.sendStatus(401)</code></pre>
                <pre data-prefix=" "><code>  }</code></pre>
                <pre data-prefix=" "><code>  const { entityId, data } = JSON.parse(req.body)</code></pre>
                <pre data-prefix=" "><code>  db.prepare('UPDATE tasks SET status=? WHERE ocs_entity_id=?')</code></pre>
                <pre data-prefix=" "><code>    .run(data.status, entityId)</code></pre>
                <pre data-prefix=" "><code>  res.sendStatus(200)</code></pre>
                <pre data-prefix=" "><code>})</code></pre>
              </div>
            </div>

            <!-- Important notes -->
            <div>
              <h3 class="text-base font-bold tracking-tight mb-3">Catatan Penting</h3>
              <div class="overflow-x-auto">
                <table class="docs-table">
                  <thead><tr><th>Topik</th><th>Detail</th></tr></thead>
                  <tbody>
                    <tr><td class="font-semibold">Response time</td><td>Endpoint kamu harus respond dalam waktu wajar. OCS tidak retry otomatis — cek <strong>Webhook Deliveries</strong> di halaman koneksi untuk melihat failure.</td></tr>
                    <tr><td class="font-semibold">Status 2xx</td><td>OCS menganggap delivery berhasil jika response code 200-299. Kode lain dicatat sebagai <code class="docs-code-sm">failed</code>.</td></tr>
                    <tr><td class="font-semibold">Idempotency</td><td>Webhook bisa dikirim lebih dari sekali untuk event yang sama. Pastikan UPDATE di local DB bersifat idempotent (upsert atau skip-if-same).</td></tr>
                    <tr><td class="font-semibold">baseUrl</td><td>Webhook dikirim ke <code class="docs-code-sm">baseUrl</code> koneksi. Pastikan sudah diisi dan dapat diakses dari server OCS.</td></tr>
                    <tr><td class="font-semibold">Local dev</td><td>Gunakan <a href="https://ngrok.com" target="_blank" class="link">ngrok</a> atau <a href="https://localtunnel.me" target="_blank" class="link">localtunnel</a> untuk expose localhost ke internet selama development.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>

        <!-- ── REFERENCE ═══════════════════════════════════════── -->
        <section data-section="reference" id="reference" class="scroll-mt-20 pb-20">
          <h2 class="docs-h2">Enums &amp; Tipe</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-lg border border-base-300 p-4 space-y-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Connection Status</p>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-success">active</span>
                <span class="badge badge-warning">paused</span>
                <span class="badge badge-error">error</span>
                <span class="badge badge-neutral">archived</span>
              </div>
            </div>
            <div class="rounded-lg border border-base-300 p-4 space-y-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Auth Type</p>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-outline">none</span>
                <span class="badge badge-outline">api_key</span>
                <span class="badge badge-outline">bearer_token</span>
                <span class="badge badge-outline">basic_auth</span>
                <span class="badge badge-outline">oauth2</span>
              </div>
            </div>
            <div class="rounded-lg border border-base-300 p-4 space-y-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Provider Type</p>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-outline">rest_api</span>
                <span class="badge badge-outline">graphql</span>
                <span class="badge badge-outline">webhook</span>
                <span class="badge badge-outline">database</span>
                <span class="badge badge-outline">file_import</span>
                <span class="badge badge-outline">custom</span>
              </div>
            </div>
            <div class="rounded-lg border border-base-300 p-4 space-y-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Sync Job Status</p>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-info">queued</span>
                <span class="badge badge-primary">running</span>
                <span class="badge badge-success">succeeded</span>
                <span class="badge badge-warning">partial</span>
                <span class="badge badge-error">failed</span>
              </div>
            </div>
            <div class="rounded-lg border border-base-300 p-4 space-y-2 sm:col-span-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">sourceEntityType — Synced (ke modul project)</p>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-primary badge-outline">task</span>
                <span class="badge badge-primary badge-outline">feature</span>
                <span class="badge badge-primary badge-outline">bug</span>
              </div>
              <p class="text-xs text-base-content/50 mt-1">Tipe di atas membuat/memperbarui record nyata di modul project. Nilai lain disimpan sebagai staging saja.</p>
            </div>
            <div class="rounded-lg border border-base-300 p-4 space-y-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Task Status</p>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-ghost">todo</span>
                <span class="badge badge-info">in-progress</span>
                <span class="badge badge-warning">blocked</span>
                <span class="badge badge-secondary">review</span>
                <span class="badge badge-success">done</span>
              </div>
            </div>
            <div class="rounded-lg border border-base-300 p-4 space-y-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Feature Status</p>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-ghost">backlog</span>
                <span class="badge badge-info">planned</span>
                <span class="badge badge-primary">in-progress</span>
                <span class="badge badge-warning">blocked</span>
                <span class="badge badge-success">done</span>
                <span class="badge badge-neutral">cancelled</span>
              </div>
            </div>
            <div class="rounded-lg border border-base-300 p-4 space-y-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Bug Status</p>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-error">open</span>
                <span class="badge badge-primary">in-progress</span>
                <span class="badge badge-success">resolved</span>
                <span class="badge badge-info">verified</span>
                <span class="badge badge-neutral">closed</span>
              </div>
            </div>
          </div>
          <div class="mt-5 rounded-lg border border-base-300 overflow-hidden">
            <div class="bg-base-200/60 px-4 py-2">
              <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">HTTP Status Codes</p>
            </div>
            <table class="table table-xs">
              <tbody>
                <tr><td class="font-mono w-16">200</td><td class="text-success font-medium">OK</td><td>Request berhasil</td></tr>
                <tr><td class="font-mono">401</td><td class="text-warning font-medium">Unauthorized</td><td>Tidak ada sesi / cookie tidak valid</td></tr>
                <tr><td class="font-mono">403</td><td class="text-warning font-medium">Forbidden</td><td>Role tidak mencukupi</td></tr>
                <tr><td class="font-mono">404</td><td class="text-error font-medium">Not Found</td><td>Connection ID tidak ditemukan</td></tr>
                <tr><td class="font-mono">422</td><td class="text-error font-medium">Unprocessable</td><td>Validasi gagal — field wajib kosong atau format salah</td></tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const origin = computed(() =>
  import.meta.client ? window.location.origin : 'https://your-workspace.example.com'
)

// Spec URL copy
const specUrlCopied = ref(false)
function copySpecUrl() {
  navigator.clipboard.writeText(`${origin.value}/api/docs/openapi.json`).then(() => {
    specUrlCopied.value = true
    setTimeout(() => { specUrlCopied.value = false }, 2000)
  })
}

// Scrollspy
const activeSection = ref('overview')
onMounted(() => {
  const sections = document.querySelectorAll<HTMLElement>('section[data-section]')
  const obs = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length) activeSection.value = (visible[0].target as HTMLElement).dataset.section!
    },
    { rootMargin: '-15% 0px -75% 0px' }
  )
  sections.forEach((s) => obs.observe(s))
  onBeforeUnmount(() => obs.disconnect())
})

function navClass(id: string) {
  const base = 'block rounded-lg px-2 py-1.5 text-sm transition-colors '
  return activeSection.value === id
    ? base + 'bg-primary/10 text-primary font-semibold'
    : base + 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
}

// Copy to clipboard
const copied = ref<string | null>(null)
function copy(id: string, text: string) {
  navigator.clipboard.writeText(text.trim()).then(() => {
    copied.value = id
    setTimeout(() => { copied.value = null }, 2000)
  })
}

const authExample = computed(() => `curl -X POST ${origin.value}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@example.com","password":"xxxx"}' \\
  -c cookies.txt`)

const authKeyExample = computed(() => `curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/push \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ocs_YOUR_API_KEY" \\
  -d '{"sourceId":"BUG-1","sourceEntityType":"bug"}'`)

const rotateKeyExample = computed(() => `curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/rotate-key \\
  -b cookies.txt`)

const listConnsExample = computed(() => `curl "${origin.value}/api/integrations?projectId=PROJECT_UUID" \\
  -b cookies.txt`)

const createConnExample = computed(() => `curl -X POST ${origin.value}/api/integrations \\
  -H "Content-Type: application/json" -b cookies.txt \\
  -d '{
    "name": "My CMS",
    "providerType": "rest_api",
    "baseUrl": "https://cms.mycompany.com",
    "authType": "bearer_token",
    "projectId": "PROJECT_UUID"
  }'`)

const getConnExample = computed(() =>
  `curl ${origin.value}/api/integrations/CONNECTION_UUID -b cookies.txt`)

const updateConnExample = computed(() => `curl -X PATCH ${origin.value}/api/integrations/CONNECTION_UUID \\
  -H "Content-Type: application/json" -b cookies.txt \\
  -d '{"name": "CMS v2", "authType": "api_key"}'`)

const mappingsExample = computed(() => `curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/mappings \\
  -H "Content-Type: application/json" -b cookies.txt \\
  -d '{"sourceField": "issue.title", "targetField": "title"}'`)

const pushBugExample = computed(() => `curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/push \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ocs_YOUR_API_KEY" \\
  -d '{
    "sourceId": "BUG-101",
    "sourceEntityType": "bug",
    "projectId": "PROJECT_UUID",
    "sourcePayload": {
      "title": "Login crash on Safari",
      "description": "Crash on iOS Safari 17 when clicking login",
      "severity": "high",
      "priority": "critical",
      "status": "open"
    }
  }'`)

const pushTaskExample = computed(() => `curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/push \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ocs_YOUR_API_KEY" \\
  -d '{
    "sourceId": "TASK-55",
    "sourceEntityType": "task",
    "projectId": "PROJECT_UUID",
    "sourcePayload": {
      "title": "Build dark mode toggle",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-04-01"
    }
  }'`)

const pushFeatureExample = computed(() => `curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/push \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ocs_YOUR_API_KEY" \\
  -d '{
    "sourceId": "FEAT-12",
    "sourceEntityType": "feature",
    "projectId": "PROJECT_UUID",
    "sourcePayload": {
      "title": "Export to PDF",
      "status": "planned",
      "priority": "medium",
      "targetRelease": "v2.3",
      "businessValue": "Requested by 20+ enterprise customers"
    }
  }'`)

const syncExample = computed(() => `curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/sync \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ocs_YOUR_API_KEY" \\
  -d '{"jobType": "full_sync"}'`)

const schemaSqlExample = `-- Jalankan sekali saat setup integrasi
ALTER TABLE tasks    ADD COLUMN ocs_synced_at TEXT;
ALTER TABLE tasks    ADD COLUMN ocs_entity_id TEXT;
ALTER TABLE features ADD COLUMN ocs_synced_at TEXT;
ALTER TABLE features ADD COLUMN ocs_entity_id TEXT;
ALTER TABLE bugs     ADD COLUMN ocs_synced_at TEXT;
ALTER TABLE bugs     ADD COLUMN ocs_entity_id TEXT;`

const clientEnvExample = `# Dapatkan nilai-nilai ini dari halaman detail koneksi di OCS Workspace
OCS_URL=https://your-workspace.example.com
OCS_API_KEY=ocs_xxxxxxxxxxxxxxxxxxxx
OCS_CONNECTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
OCS_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DB_PATH=./app.db`

const clientPythonExample = `# ocs_sync.py — kirim task/feature/bug ke OCS Workspace
import os, sqlite3, json, urllib.request, urllib.error
from datetime import datetime, timezone

OCS_URL        = os.environ["OCS_URL"]
OCS_API_KEY    = os.environ["OCS_API_KEY"]
OCS_CONN_ID    = os.environ["OCS_CONNECTION_ID"]
OCS_PROJECT_ID = os.environ["OCS_PROJECT_ID"]
DB_PATH        = os.environ.get("DB_PATH", "app.db")

def push(source_id, entity_type, payload):
    url  = f"{OCS_URL}/api/integrations/{OCS_CONN_ID}/push"
    body = json.dumps({
        "sourceId":         source_id,
        "sourceEntityType": entity_type,
        "projectId":        OCS_PROJECT_ID,
        "sourcePayload":    payload,
    }).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "Content-Type":  "application/json",
        "Authorization": f"Bearer {OCS_API_KEY}",
    })
    with urllib.request.urlopen(req) as res:
        return json.load(res)

def sync_table(conn, table, entity_type, fields):
    cols = ", ".join(fields)
    rows = conn.execute(
        f"SELECT id, {cols} FROM {table} WHERE ocs_synced_at IS NULL"
        f" OR updated_at > ocs_synced_at"
    ).fetchall()
    col_names = ["id"] + fields
    for row in rows:
        rec = dict(zip(col_names, row))
        source_id = f"{entity_type.upper()}-{rec['id']}"
        try:
            res = push(source_id, entity_type, rec)
            now = datetime.now(timezone.utc).isoformat()
            conn.execute(
                f"UPDATE {table} SET ocs_synced_at=?, ocs_entity_id=? WHERE id=?",
                (now, res.get("mappedEntityId"), rec["id"]),
            )
            print(f"  {source_id} \u2192 {res['action']} ({res.get('mappedEntityId', '-')})") 
        except urllib.error.HTTPError as e:
            print(f"  ERROR {source_id}: HTTP {e.code} \u2014 {e.read().decode()}")
    conn.commit()

def main():
    conn = sqlite3.connect(DB_PATH)
    print("[OCS Sync] Syncing tasks...")
    sync_table(conn, "tasks",    "task",    ["title", "description", "status", "priority", "due_date"])
    print("[OCS Sync] Syncing features...")
    sync_table(conn, "features", "feature", ["title", "description", "status", "priority"])
    print("[OCS Sync] Syncing bugs...")
    sync_table(conn, "bugs",     "bug",     ["title", "description", "status", "severity", "priority"])
    conn.close()
    print("[OCS Sync] Done.")

if __name__ == "__main__":
    main()`

const clientNodeExample = `// ocs-sync.mjs — npm install better-sqlite3
import Database from 'better-sqlite3'

const OCS_URL    = process.env.OCS_URL
const API_KEY    = process.env.OCS_API_KEY
const CONN_ID    = process.env.OCS_CONNECTION_ID
const PROJECT_ID = process.env.OCS_PROJECT_ID

async function push(sourceId, entityType, payload) {
  const res = await fetch(\`\${OCS_URL}/api/integrations/\${CONN_ID}/push\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${API_KEY}\` },
    body: JSON.stringify({ sourceId, sourceEntityType: entityType, projectId: PROJECT_ID, sourcePayload: payload }),
  })
  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${await res.text()}\`)
  return res.json()
}

async function syncTable(db, table, entityType, fields) {
  const rows = db.prepare(
    \`SELECT id, \${fields} FROM \${table} WHERE ocs_synced_at IS NULL OR updated_at > ocs_synced_at\`
  ).all()
  for (const row of rows) {
    const sourceId = \`\${entityType.toUpperCase()}-\${row.id}\`
    try {
      const result = await push(sourceId, entityType, row)
      db.prepare(\`UPDATE \${table} SET ocs_synced_at=?, ocs_entity_id=? WHERE id=?\`)
        .run(new Date().toISOString(), result.mappedEntityId, row.id)
      console.log(\`  \${sourceId} \u2192 \${result.action} (\${result.mappedEntityId ?? '-'})\`)
    } catch (err) { console.error(\`  ERROR \${sourceId}:\`, err.message) }
  }
}

const db = new Database(process.env.DB_PATH ?? 'app.db')
await syncTable(db, 'tasks',    'task',    'title, description, status, priority, due_date')
await syncTable(db, 'features', 'feature', 'title, description, status, priority')
await syncTable(db, 'bugs',     'bug',     'title, description, status, severity, priority')
db.close()`

const quickstartExample = computed(() => `# STEP 1: Login
curl -X POST ${origin.value}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@your-workspace.com","password":"xxxx"}' \\
  -c cookies.txt

# STEP 2: Daftarkan CMS sebagai koneksi (sekali saja)
curl -X POST ${origin.value}/api/integrations \\
  -H "Content-Type: application/json" -b cookies.txt \\
  -d '{"name":"My CMS","providerType":"rest_api","projectId":"PROJ_UUID"}'
  # Simpan "id" dari response sebagai CONNECTION_UUID
  # Simpan "apiKey" dari response sebagai API_KEY (hanya tampil sekali!)

# STEP 3: Field mapping (opsional)
curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/mappings \\
  -H "Content-Type: application/json" -b cookies.txt \\
  -d '{"sourceField":"cms_title","targetField":"title"}'

# RUNTIME: Push menggunakan API key (bukan session)
curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/push \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ocs_YOUR_API_KEY" \\
  -d '{"sourceId":"BUG-42","sourceEntityType":"bug","projectId":"PROJ_UUID","sourcePayload":{"title":"Crash on login","severity":"high","status":"open"}}'

# Push task
curl -X POST ${origin.value}/api/integrations/CONNECTION_UUID/push \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ocs_YOUR_API_KEY" \\
  -d '{"sourceId":"TASK-7","sourceEntityType":"task","projectId":"PROJ_UUID","sourcePayload":{"title":"Build X","status":"in-progress"}}'

# Cek status koneksi (gunakan session)
curl ${origin.value}/api/integrations/CONNECTION_UUID -b cookies.txt`)
</script>

<style scoped>
@reference "../../assets/css/main.css";

.docs-section-label {
  @apply mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary;
}
.docs-h2 {
  @apply text-2xl font-bold tracking-tight text-base-content mb-3;
}
.docs-desc {
  @apply text-sm leading-relaxed text-base-content/70;
}
.docs-code {
  @apply rounded bg-base-200 px-1.5 py-0.5 font-mono text-[0.8em] text-base-content;
}
.docs-code-sm {
  @apply rounded bg-base-200 px-1 font-mono text-[0.78em] text-base-content;
}
.docs-info-box {
  @apply rounded-lg border border-info/30 bg-info/8 px-4 py-3 text-sm text-base-content/80;
}
.docs-endpoint-header {
  @apply flex flex-wrap items-center gap-2.5 rounded-lg border border-base-300 bg-base-200/50 px-4 py-3;
}
.docs-endpoint-path {
  @apply font-mono text-base font-semibold text-base-content;
}
.docs-code-block {
  @apply overflow-hidden rounded-lg border border-base-300;
}
.docs-code-header {
  @apply flex items-center justify-between bg-neutral/90 px-4 py-2 text-xs text-neutral-content/60;
}
.docs-copy-btn {
  @apply rounded px-2 py-0.5 text-xs transition-colors hover:bg-neutral-content/10 active:bg-neutral-content/20 cursor-pointer;
}
.docs-code-response {
  @apply border-t border-white/10 bg-neutral/95 px-4 py-2.5;
}
</style>
