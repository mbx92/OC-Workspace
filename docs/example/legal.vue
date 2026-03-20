<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Legal Documents</h1>
        <p class="text-sm text-base-content/50 mt-0.5">Kelola dokumen proposal, penawaran, dan agreement platform.</p>
      </div>
      <button class="btn btn-primary btn-sm gap-2" @click="saveDocuments" :disabled="isSaving">
        <IconDeviceFloppy class="w-4 h-4"/>
        <span v-if="isSaving">Menyimpan...</span>
        <span v-else>Simpan Dokumen</span>
      </button>
    </div>

    <!-- Alert Banner -->
    <div v-if="alertMessage" :class="`alert border py-3 ${alertType === 'success' ? 'bg-success/10 border-success/30 text-success' : 'bg-error/10 border-error/30 text-error'}`">
      <IconCircleCheck v-if="alertType === 'success'" class="w-5 h-5 shrink-0"/>
      <IconAlertTriangle v-else class="w-5 h-5 shrink-0"/>
      <p class="font-semibold text-sm">{{ alertMessage }}</p>
      <button class="btn btn-ghost btn-xs ml-auto shrink-0" @click="alertMessage = ''">✕</button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-base-300 gap-0">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px',
          activeTab === tab.key
            ? 'border-primary text-primary'
            : 'border-transparent text-base-content/50 hover:text-base-content'
        ]"
      >
        <component :is="tab.icon" class="w-4 h-4 inline-block mr-1.5 -mt-0.5"/>
        {{ tab.label }}
      </button>
    </div>

    <!-- ═══════════════ TAB: PROPOSAL ═══════════════ -->
    <div v-if="activeTab === 'proposal'" class="space-y-6">
      <!-- Quick Info -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Status Proposal</p>
          <div class="flex items-center gap-2">
            <span :class="statusBadge(docs.proposal.status)">{{ docs.proposal.status }}</span>
          </div>
        </div>
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Versi Terakhir</p>
          <p class="text-lg font-bold">v{{ docs.proposal.version }}</p>
        </div>
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Terakhir Diupdate</p>
          <p class="text-sm font-medium">{{ docs.proposal.lastUpdated }}</p>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-5 space-y-4">
          <h2 class="font-bold text-lg flex items-center gap-2">
            <IconFileDescription class="w-5 h-5 text-primary"/> Proposal Proyek
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Nama Proyek</span></label>
              <input type="text" v-model="docs.proposal.projectName" class="input input-bordered w-full" />
            </div>
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Klien / Perusahaan</span></label>
              <input type="text" v-model="docs.proposal.clientName" class="input input-bordered w-full" placeholder="Nama klien atau perusahaan" />
            </div>
          </div>

          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Ringkasan Eksekutif</span></label>
            <textarea v-model="docs.proposal.summary" class="textarea textarea-bordered w-full h-28 resize-none" placeholder="Deskripsi singkat tentang proyek..."></textarea>
          </div>

          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Scope of Work</span></label>
            <textarea v-model="docs.proposal.scope" class="textarea textarea-bordered w-full h-40 resize-y" placeholder="Detail scope pekerjaan..."></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Timeline</span></label>
              <input type="text" v-model="docs.proposal.timeline" class="input input-bordered w-full" placeholder="e.g. 8 minggu" />
            </div>
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Status</span></label>
              <select v-model="docs.proposal.status" class="select select-bordered w-full">
                <option>Draft</option>
                <option>Dikirim</option>
                <option>Disetujui</option>
                <option>Ditolak</option>
              </select>
            </div>
          </div>

          <!-- Deliverables -->
          <div>
            <label class="label"><span class="label-text font-medium">Deliverables</span></label>
            <div class="space-y-2">
              <div v-for="(item, i) in docs.proposal.deliverables" :key="i" class="flex items-center gap-2">
                <input type="text" v-model="docs.proposal.deliverables[i]" class="input input-bordered input-sm grow" />
                <button class="btn btn-ghost btn-sm btn-square text-error" @click="docs.proposal.deliverables.splice(i, 1)">
                  <IconTrash class="w-4 h-4"/>
                </button>
              </div>
              <button class="btn btn-ghost btn-sm gap-1" @click="docs.proposal.deliverables.push('')">
                <IconPlus class="w-4 h-4"/> Tambah Deliverable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ TAB: PENAWARAN ═══════════════ -->
    <div v-if="activeTab === 'penawaran'" class="space-y-6">
      <!-- Quick Info -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Status Penawaran</p>
          <span :class="statusBadge(docs.penawaran.status)">{{ docs.penawaran.status }}</span>
        </div>
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Total Nilai</p>
          <p class="text-xl font-extrabold text-secondary">{{ formatCurrency(totalPenawaran) }}</p>
        </div>
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Berlaku Sampai</p>
          <p class="text-sm font-medium">{{ docs.penawaran.validUntil || '-' }}</p>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-5 space-y-4">
          <h2 class="font-bold text-lg flex items-center gap-2">
            <IconCurrencyDollar class="w-5 h-5 text-secondary"/> Surat Penawaran
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Nomor Penawaran</span></label>
              <input type="text" v-model="docs.penawaran.number" class="input input-bordered w-full" placeholder="e.g. ST/PNW/2026/001" />
            </div>
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Berlaku Sampai</span></label>
              <input type="date" v-model="docs.penawaran.validUntil" class="input input-bordered w-full" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Nama Klien</span></label>
              <input type="text" v-model="docs.penawaran.clientName" class="input input-bordered w-full" />
            </div>
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Status</span></label>
              <select v-model="docs.penawaran.status" class="select select-bordered w-full">
                <option>Draft</option>
                <option>Dikirim</option>
                <option>Disetujui</option>
                <option>Ditolak</option>
                <option>Expired</option>
              </select>
            </div>
          </div>

          <!-- Item Table -->
          <div>
            <label class="label"><span class="label-text font-medium">Daftar Item Penawaran</span></label>
            <div class="overflow-x-auto">
              <table class="table table-sm w-full">
                <thead>
                  <tr class="bg-base-200/60 text-xs">
                    <th class="w-8">#</th>
                    <th>Deskripsi Item</th>
                    <th class="w-40 text-right">Harga (Rp)</th>
                    <th class="w-14"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in docs.penawaran.items" :key="i" class="hover">
                    <td class="text-base-content/50 font-mono text-xs">{{ i + 1 }}</td>
                    <td>
                      <input type="text" v-model="item.description" class="input input-bordered input-sm w-full" placeholder="Deskripsi..." />
                    </td>
                    <td>
                      <input type="number" v-model.number="item.price" class="input input-bordered input-sm w-full text-right font-mono" />
                    </td>
                    <td>
                      <button class="btn btn-ghost btn-sm btn-square text-error" @click="docs.penawaran.items.splice(i, 1)">
                        <IconTrash class="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-base-300">
                    <td colspan="2">
                      <button class="btn btn-ghost btn-sm gap-1" @click="docs.penawaran.items.push({ description: '', price: 0 })">
                        <IconPlus class="w-4 h-4"/> Tambah Item
                      </button>
                    </td>
                    <td class="text-right font-mono font-bold text-lg">{{ formatCurrency(totalPenawaran) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Payment Terms -->
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Syarat Pembayaran</span></label>
            <textarea v-model="docs.penawaran.paymentTerms" class="textarea textarea-bordered w-full h-20 resize-none" placeholder="e.g. 40% di muka, 30% setelah milestone, 30% setelah selesai"></textarea>
          </div>

          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Catatan Tambahan</span></label>
            <textarea v-model="docs.penawaran.notes" class="textarea textarea-bordered w-full h-20 resize-none" placeholder="Catatan khusus untuk klien..."></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ TAB: AGREEMENT ═══════════════ -->
    <div v-if="activeTab === 'agreement'" class="space-y-6">
      <!-- Quick Info -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Status Agreement</p>
          <span :class="statusBadge(docs.agreement.status)">{{ docs.agreement.status }}</span>
        </div>
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Tanggal Efektif</p>
          <p class="text-sm font-medium">{{ docs.agreement.effectiveDate || '-' }}</p>
        </div>
        <div class="card bg-base-100 border border-base-300 p-4">
          <p class="text-xs text-base-content/50 mb-1">Tanggal Berakhir</p>
          <p class="text-sm font-medium">{{ docs.agreement.endDate || '-' }}</p>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-5 space-y-4">
          <h2 class="font-bold text-lg flex items-center gap-2">
            <IconFileCheck class="w-5 h-5 text-success"/> Perjanjian Kerjasama
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Nomor Perjanjian</span></label>
              <input type="text" v-model="docs.agreement.number" class="input input-bordered w-full" placeholder="e.g. ST/AGR/2026/001" />
            </div>
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Status</span></label>
              <select v-model="docs.agreement.status" class="select select-bordered w-full">
                <option>Draft</option>
                <option>Menunggu Tanda Tangan</option>
                <option>Aktif</option>
                <option>Expired</option>
                <option>Dibatalkan</option>
              </select>
            </div>
          </div>

          <!-- Pihak-pihak -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="card bg-base-200/50 border border-base-300 p-4 space-y-3">
              <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Pihak Pertama (Penyedia)</p>
              <div class="form-control w-full">
                <label class="label py-0.5"><span class="label-text text-xs">Nama / Perusahaan</span></label>
                <input type="text" v-model="docs.agreement.partyOne.name" class="input input-bordered input-sm w-full" />
              </div>
              <div class="form-control w-full">
                <label class="label py-0.5"><span class="label-text text-xs">Alamat</span></label>
                <input type="text" v-model="docs.agreement.partyOne.address" class="input input-bordered input-sm w-full" />
              </div>
              <div class="form-control w-full">
                <label class="label py-0.5"><span class="label-text text-xs">PIC / Penandatangan</span></label>
                <input type="text" v-model="docs.agreement.partyOne.pic" class="input input-bordered input-sm w-full" />
              </div>
            </div>
            <div class="card bg-base-200/50 border border-base-300 p-4 space-y-3">
              <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Pihak Kedua (Klien)</p>
              <div class="form-control w-full">
                <label class="label py-0.5"><span class="label-text text-xs">Nama / Perusahaan</span></label>
                <input type="text" v-model="docs.agreement.partyTwo.name" class="input input-bordered input-sm w-full" />
              </div>
              <div class="form-control w-full">
                <label class="label py-0.5"><span class="label-text text-xs">Alamat</span></label>
                <input type="text" v-model="docs.agreement.partyTwo.address" class="input input-bordered input-sm w-full" />
              </div>
              <div class="form-control w-full">
                <label class="label py-0.5"><span class="label-text text-xs">PIC / Penandatangan</span></label>
                <input type="text" v-model="docs.agreement.partyTwo.pic" class="input input-bordered input-sm w-full" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Tanggal Efektif</span></label>
              <input type="date" v-model="docs.agreement.effectiveDate" class="input input-bordered w-full" />
            </div>
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Tanggal Berakhir</span></label>
              <input type="date" v-model="docs.agreement.endDate" class="input input-bordered w-full" />
            </div>
          </div>

          <!-- Clauses -->
          <div>
            <label class="label"><span class="label-text font-medium">Pasal-Pasal Perjanjian</span></label>
            <div class="space-y-3">
              <div v-for="(clause, i) in docs.agreement.clauses" :key="i" class="card bg-base-200/40 border border-base-300 p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-sm text-primary">Pasal {{ i + 1 }}</p>
                  <button class="btn btn-ghost btn-xs btn-square text-error" @click="docs.agreement.clauses.splice(i, 1)">
                    <IconTrash class="w-4 h-4"/>
                  </button>
                </div>
                <input type="text" v-model="clause.title" class="input input-bordered input-sm w-full" placeholder="Judul pasal..." />
                <textarea v-model="clause.content" class="textarea textarea-bordered w-full text-sm h-24 resize-y" placeholder="Isi pasal..."></textarea>
              </div>
              <button class="btn btn-ghost btn-sm gap-1" @click="docs.agreement.clauses.push({ title: '', content: '' })">
                <IconPlus class="w-4 h-4"/> Tambah Pasal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ PREVIEW PANEL ═══════════════ -->
    <div class="card bg-base-100 border border-base-300">
      <div class="card-body p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-base flex items-center gap-2">
            <IconEye class="w-5 h-5"/> Preview Dokumen
          </h2>
          <button class="btn btn-outline btn-sm gap-2" @click="downloadPdf" :disabled="isDownloadingPdf">
            <IconDownload class="w-4 h-4"/>
            <span v-if="isDownloadingPdf">Membuat PDF...</span>
            <span v-else>Download PDF</span>
          </button>
        </div>

        <!-- Proposal Preview -->
        <div v-if="activeTab === 'proposal'" class="prose prose-sm max-w-none" id="printArea">
          <div class="text-center mb-6">
            <h1 class="text-xl font-bold mb-1">PROPOSAL PROYEK</h1>
            <h2 class="text-lg text-primary font-semibold">{{ docs.proposal.projectName }}</h2>
            <p class="text-sm text-base-content/50">Versi {{ docs.proposal.version }} — {{ docs.proposal.lastUpdated }}</p>
          </div>
          <div class="divider"></div>
          <p class="text-xs font-semibold uppercase text-base-content/50 tracking-wide">Dipersiapkan untuk</p>
          <p class="font-semibold">{{ docs.proposal.clientName || '[Nama Klien]' }}</p>
          <h3 class="font-bold mt-4">Ringkasan Eksekutif</h3>
          <p class="whitespace-pre-line">{{ docs.proposal.summary }}</p>
          <h3 class="font-bold mt-4">Scope of Work</h3>
          <p class="whitespace-pre-line">{{ docs.proposal.scope }}</p>
          <h3 class="font-bold mt-4">Timeline</h3>
          <p>{{ docs.proposal.timeline }}</p>
          <h3 class="font-bold mt-4">Deliverables</h3>
          <ul>
            <li v-for="(d, i) in docs.proposal.deliverables" :key="i">{{ d }}</li>
          </ul>
        </div>

        <!-- Penawaran Preview -->
        <div v-if="activeTab === 'penawaran'" class="prose prose-sm max-w-none" id="printArea">
          <div class="text-center mb-6">
            <h1 class="text-xl font-bold mb-1">SURAT PENAWARAN</h1>
            <p class="font-mono text-sm">{{ docs.penawaran.number }}</p>
          </div>
          <div class="divider"></div>
          <p><strong>Kepada Yth.</strong> {{ docs.penawaran.clientName || '[Nama Klien]' }}</p>
          <p class="text-sm text-base-content/60">Berlaku sampai: {{ docs.penawaran.validUntil || '-' }}</p>
          <div class="overflow-x-auto mt-4">
            <table class="table table-sm border">
              <thead><tr class="bg-base-200"><th>#</th><th>Item</th><th class="text-right">Harga</th></tr></thead>
              <tbody>
                <tr v-for="(item, i) in docs.penawaran.items" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ item.description }}</td>
                  <td class="text-right font-mono">{{ formatCurrency(item.price) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="font-bold border-t-2"><td colspan="2">TOTAL</td><td class="text-right font-mono">{{ formatCurrency(totalPenawaran) }}</td></tr>
              </tfoot>
            </table>
          </div>
          <h3 class="font-bold mt-4">Syarat Pembayaran</h3>
          <p class="whitespace-pre-line">{{ docs.penawaran.paymentTerms }}</p>
          <div v-if="docs.penawaran.notes">
            <h3 class="font-bold mt-4">Catatan</h3>
            <p class="whitespace-pre-line">{{ docs.penawaran.notes }}</p>
          </div>
        </div>

        <!-- Agreement Preview -->
        <div v-if="activeTab === 'agreement'" class="prose prose-sm max-w-none" id="printArea">
          <div class="text-center mb-6">
            <h1 class="text-xl font-bold mb-1">PERJANJIAN KERJASAMA</h1>
            <p class="font-mono text-sm">{{ docs.agreement.number }}</p>
          </div>
          <div class="divider"></div>
          <p>Perjanjian ini dibuat dan ditandatangani pada tanggal <strong>{{ docs.agreement.effectiveDate || '___________' }}</strong> oleh dan antara:</p>
          <div class="grid grid-cols-2 gap-4 my-4 not-prose">
            <div class="card bg-base-200/40 border border-base-300 p-3">
              <p class="text-xs font-semibold text-base-content/50 uppercase mb-1">Pihak Pertama</p>
              <p class="font-bold text-sm">{{ docs.agreement.partyOne.name || '-' }}</p>
              <p class="text-xs text-base-content/60">{{ docs.agreement.partyOne.address }}</p>
              <p class="text-xs mt-1">PIC: {{ docs.agreement.partyOne.pic }}</p>
            </div>
            <div class="card bg-base-200/40 border border-base-300 p-3">
              <p class="text-xs font-semibold text-base-content/50 uppercase mb-1">Pihak Kedua</p>
              <p class="font-bold text-sm">{{ docs.agreement.partyTwo.name || '-' }}</p>
              <p class="text-xs text-base-content/60">{{ docs.agreement.partyTwo.address }}</p>
              <p class="text-xs mt-1">PIC: {{ docs.agreement.partyTwo.pic }}</p>
            </div>
          </div>
          <div v-for="(clause, i) in docs.agreement.clauses" :key="i" class="mb-4">
            <h3 class="font-bold">Pasal {{ i + 1 }}: {{ clause.title }}</h3>
            <p class="whitespace-pre-line">{{ clause.content }}</p>
          </div>
          <div class="divider mt-8"></div>
          <p class="text-sm text-base-content/60">Demikian perjanjian ini dibuat dalam 2 (dua) rangkap bermeterai cukup, masing-masing mempunyai kekuatan hukum yang sama.</p>
          <div class="grid grid-cols-2 gap-8 mt-8 text-center not-prose">
            <div>
              <p class="text-xs font-semibold text-base-content/50 uppercase">Pihak Pertama</p>
              <div class="h-20 border-b border-base-300 mt-4 mb-2"></div>
              <p class="font-semibold text-sm">{{ docs.agreement.partyOne.pic || '___________' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-base-content/50 uppercase">Pihak Kedua</p>
              <div class="h-20 border-b border-base-300 mt-4 mb-2"></div>
              <p class="font-semibold text-sm">{{ docs.agreement.partyTwo.pic || '___________' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  IconDeviceFloppy,
  IconCircleCheck,
  IconAlertTriangle,
  IconFileDescription,
  IconCurrencyDollar,
  IconFileCheck,
  IconTrash,
  IconPlus,
  IconEye,
  IconDownload,
} from '@tabler/icons-vue'

definePageMeta({ layout: 'dashboard' })

const tabs = [
  { key: 'proposal', label: 'Proposal', icon: IconFileDescription },
  { key: 'penawaran', label: 'Penawaran', icon: IconCurrencyDollar },
  { key: 'agreement', label: 'Agreement', icon: IconFileCheck },
]
const activeTab = ref('proposal')

const isSaving = ref(false)
const isDownloadingPdf = ref(false)
const alertMessage = ref('')
const alertType = ref('success')

const legacyProposalDefaults = {
  projectName: 'SignalTribe — Platform Trading Signals SaaS',
  summary: 'SignalTribe adalah platform SaaS untuk trading signals yang menghubungkan analis trading profesional dengan trader yang ingin mendapatkan sinyal trading berkualitas tinggi secara real-time.\n\nPlatform ini memungkinkan analis untuk mempublikasikan sinyal trading (LONG/SHORT) dengan entry, take-profit, dan stop-loss. Trader dapat berlangganan analis favorit dan menerima notifikasi sinyal real-time.',
  scope: '• Autentikasi & manajemen user (role-based: Admin, Analyst, Trader)\n• Dashboard multi-role (Admin, Analyst, Trader)\n• Sistem trading signals (publish, update, close)\n• Trading journal (CRUD, draft/published)\n• Sistem berlangganan (subscribe/unsubscribe, pembayaran)\n• Payment gateway integration (Midtrans/Xendit)\n• Notifikasi in-app\n• Landing page CMS\n• Public signal feed',
  timeline: '8 minggu (Fase 1-5)',
  deliverables: [
    'Source code aplikasi (Nuxt 3 + Prisma)',
    'Database schema, migrasi, dan seed data',
    'API documentation',
    'Deployment guide (Docker)',
    'User guide per role',
    'Admin guide',
  ],
}

const professionalProposalDefaults = {
  projectName: 'Proposal Pengembangan Platform SignalTribe',
  summary: 'Dokumen ini mengusulkan pengembangan SignalTribe sebagai platform digital berlangganan untuk distribusi trading signal dan insight pasar secara terstruktur, aman, dan skalabel.\n\nSolusi dirancang untuk mendukung proses bisnis end-to-end, mulai dari pengelolaan analis, publikasi sinyal, pengaturan akses pelanggan, notifikasi real-time, hingga panel administrasi dan pengelolaan konten landing page.\n\nMelalui implementasi ini, klien memperoleh fondasi produk yang siap dikembangkan secara bertahap, mempermudah monetisasi layanan analis, serta memperkuat kredibilitas brand melalui pengalaman pengguna yang konsisten dan profesional.',
  scope: '• Analisis kebutuhan dan perumusan alur bisnis inti platform\n• Implementasi autentikasi dan otorisasi berbasis peran (Admin, Analyst, User)\n• Pengembangan dashboard operasional untuk admin, analis, dan pengguna akhir\n• Modul publikasi signal trading lengkap dengan entry, take-profit, stop-loss, dan status signal\n• Modul trading journal untuk dokumentasi insight, evaluasi, dan edukasi analis\n• Sistem langganan analis termasuk aktivasi, pengelolaan akses, dan histori subscription\n• Integrasi notifikasi real-time untuk update signal dan aktivitas penting pengguna\n• Landing page berbasis CMS untuk kebutuhan pemasaran dan pengelolaan konten\n• Penyusunan API, struktur database, dan fondasi teknis untuk pengembangan lanjutan',
  timeline: 'Estimasi 8 minggu kerja dengan pelaksanaan bertahap per fase, mencakup analisis, pengembangan, pengujian, user acceptance testing, dan persiapan go-live.',
  deliverables: [
    'Dokumen proposal dan ruang lingkup implementasi yang telah disepakati',
    'Source code aplikasi web berbasis Nuxt 3 dan Prisma',
    'Desain skema database, migrasi, dan data awal untuk kebutuhan operasional',
    'REST API untuk fitur inti platform dan integrasi lanjutan',
    'Panel admin, dashboard analis, dan dashboard pengguna yang siap digunakan',
    'Dokumentasi teknis, panduan deployment, dan panduan penggunaan per peran',
  ],
}

const hasSameItems = (left = [], right = []) => {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
  return left.every((item, index) => item === right[index])
}

// Default data - loaded from settings
const docs = reactive({
  proposal: {
    projectName: professionalProposalDefaults.projectName,
    clientName: '',
    summary: professionalProposalDefaults.summary,
    scope: professionalProposalDefaults.scope,
    timeline: professionalProposalDefaults.timeline,
    deliverables: [...professionalProposalDefaults.deliverables],
    version: '1.1',
    status: 'Draft',
    lastUpdated: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  penawaran: {
    number: 'ST/PNW/2026/001',
    clientName: '',
    validUntil: '',
    status: 'Draft',
    items: [
      { description: 'Backend API Development', price: 15000000 },
      { description: 'Frontend Integration', price: 10000000 },
      { description: 'Database Design & Migration', price: 5000000 },
      { description: 'Auth & Security System', price: 5000000 },
      { description: 'Payment Gateway Integration', price: 10000000 },
      { description: 'Testing & QA', price: 5000000 },
      { description: 'Docker & CI/CD Setup', price: 5000000 },
      { description: 'Documentation', price: 3000000 },
    ],
    paymentTerms: '• 40% di muka setelah penandatanganan perjanjian\n• 30% setelah milestone MVP (Fase 3)\n• 30% setelah project selesai dan go-live',
    notes: 'Estimasi biaya belum termasuk biaya hosting, domain, dan biaya payment gateway.\nRevisi maksimal 3x per fase.',
  },
  agreement: {
    number: 'ST/AGR/2026/001',
    status: 'Draft',
    effectiveDate: '',
    endDate: '',
    partyOne: {
      name: 'SignalTribe Development Team',
      address: '',
      pic: '',
    },
    partyTwo: {
      name: '',
      address: '',
      pic: '',
    },
    clauses: [
      {
        title: 'Ruang Lingkup Pekerjaan',
        content: 'Pihak Pertama setuju untuk mengembangkan platform SignalTribe sesuai dengan spesifikasi yang tercantum dalam Proposal Proyek dan Surat Penawaran yang telah disetujui oleh kedua belah pihak.',
      },
      {
        title: 'Jangka Waktu',
        content: 'Perjanjian ini berlaku sejak tanggal penandatanganan dan berakhir setelah seluruh deliverables diserahkan dan disetujui oleh Pihak Kedua, dengan estimasi waktu pengerjaan 8 (delapan) minggu kerja.',
      },
      {
        title: 'Biaya dan Pembayaran',
        content: 'Total biaya pengerjaan sesuai dengan Surat Penawaran yang telah disetujui.\nPembayaran dilakukan secara bertahap:\n- Tahap 1 (40%): Setelah penandatanganan perjanjian\n- Tahap 2 (30%): Setelah milestone MVP\n- Tahap 3 (30%): Setelah go-live dan serah terima',
      },
      {
        title: 'Hak Kekayaan Intelektual',
        content: 'Setelah pembayaran lunas, seluruh source code dan aset digital yang dihasilkan dari proyek ini menjadi milik Pihak Kedua sepenuhnya. Pihak Pertama tidak akan menggunakan, mendistribusikan, atau menjual kembali source code yang sama kepada pihak lain.',
      },
      {
        title: 'Kerahasiaan',
        content: 'Kedua belah pihak setuju untuk menjaga kerahasiaan informasi yang diperoleh selama kerjasama ini. Informasi rahasia meliputi namun tidak terbatas pada: data bisnis, strategi, source code, dan informasi pengguna.',
      },
      {
        title: 'Garansi',
        content: 'Pihak Pertama memberikan garansi bug fix selama 30 (tiga puluh) hari kalender setelah tanggal go-live. Garansi tidak mencakup penambahan fitur baru, perubahan desain, atau kerusakan akibat modifikasi oleh pihak lain.',
      },
      {
        title: 'Penyelesaian Sengketa',
        content: 'Apabila terjadi perselisihan, kedua belah pihak sepakat untuk menyelesaikan secara musyawarah. Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui Badan Arbitrase Nasional Indonesia (BANI).',
      },
    ],
  },
})

// Load saved data from settings
const { data: savedDocs } = await useAsyncData('legalDocs', () => $fetch('/api/settings'))
if (savedDocs.value?.legalDocuments) {
  try {
    const parsed = JSON.parse(savedDocs.value.legalDocuments)
    if (parsed.proposal) {
      const normalizedProposal = { ...parsed.proposal }

      if (!normalizedProposal.projectName || normalizedProposal.projectName === legacyProposalDefaults.projectName) {
        normalizedProposal.projectName = professionalProposalDefaults.projectName
      }

      if (!normalizedProposal.summary || normalizedProposal.summary === legacyProposalDefaults.summary) {
        normalizedProposal.summary = professionalProposalDefaults.summary
      }

      if (!normalizedProposal.scope || normalizedProposal.scope === legacyProposalDefaults.scope) {
        normalizedProposal.scope = professionalProposalDefaults.scope
      }

      if (!normalizedProposal.timeline || normalizedProposal.timeline === legacyProposalDefaults.timeline) {
        normalizedProposal.timeline = professionalProposalDefaults.timeline
      }

      if (!Array.isArray(normalizedProposal.deliverables) || hasSameItems(normalizedProposal.deliverables, legacyProposalDefaults.deliverables)) {
        normalizedProposal.deliverables = [...professionalProposalDefaults.deliverables]
      }

      if (!normalizedProposal.version || normalizedProposal.version === '1.0') {
        normalizedProposal.version = '1.1'
      }

      Object.assign(docs.proposal, normalizedProposal)
    }
    Object.assign(docs.penawaran, parsed.penawaran || {})
    if (parsed.agreement) {
      Object.assign(docs.agreement, { ...docs.agreement, ...parsed.agreement })
      if (parsed.agreement.partyOne) Object.assign(docs.agreement.partyOne, parsed.agreement.partyOne)
      if (parsed.agreement.partyTwo) Object.assign(docs.agreement.partyTwo, parsed.agreement.partyTwo)
      if (parsed.agreement.clauses) docs.agreement.clauses = parsed.agreement.clauses
    }
  } catch {}
}

const totalPenawaran = computed(() =>
  docs.penawaran.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0)
}

const statusBadge = (status) => {
  const map = {
    'Draft': 'badge badge-sm badge-ghost',
    'Dikirim': 'badge badge-sm badge-info badge-outline',
    'Disetujui': 'badge badge-sm badge-success badge-outline',
    'Aktif': 'badge badge-sm badge-success badge-outline',
    'Ditolak': 'badge badge-sm badge-error badge-outline',
    'Expired': 'badge badge-sm badge-warning badge-outline',
    'Dibatalkan': 'badge badge-sm badge-error badge-outline',
    'Menunggu Tanda Tangan': 'badge badge-sm badge-warning badge-outline',
  }
  return map[status] || 'badge badge-sm badge-ghost'
}

const formatHumanDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const normalizePdfLines = (value) => {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

const buildPdfFilename = () => {
  const baseName = {
    proposal: docs.proposal.projectName || 'proposal',
    penawaran: docs.penawaran.number || 'penawaran',
    agreement: docs.agreement.number || 'agreement',
  }[activeTab.value] || 'legal-doc'

  return `${baseName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'legal-doc'
}

const ensurePdfSpace = (pdf, cursorY, neededHeight = 40) => {
  const pageHeight = pdf.internal.pageSize.getHeight()
  if (cursorY + neededHeight > pageHeight - 48) {
    pdf.addPage()
    return 56
  }

  return cursorY
}

const addPdfParagraph = (pdf, text, cursorY, options = {}) => {
  const {
    fontSize = 10,
    indent = 0,
    gapAfter = 10,
    color = [28, 28, 28],
    lineHeight = 14,
  } = options

  const content = String(text || '').trim()
  if (!content) return cursorY

  const pageWidth = pdf.internal.pageSize.getWidth()
  const maxWidth = pageWidth - 96 - indent
  const lines = pdf.splitTextToSize(content, maxWidth)
  const neededHeight = lines.length * lineHeight + gapAfter
  const nextY = ensurePdfSpace(pdf, cursorY, neededHeight)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(fontSize)
  pdf.setTextColor(...color)
  pdf.text(lines, 48 + indent, nextY)

  return nextY + (lines.length * lineHeight) + gapAfter
}

const addPdfSectionTitle = (pdf, title, cursorY) => {
  const nextY = ensurePdfSpace(pdf, cursorY, 28)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.setTextColor(18, 74, 52)
  pdf.text(String(title || '').toUpperCase(), 48, nextY)
  return nextY + 18
}

const addPdfBulletList = (pdf, items, cursorY) => {
  let nextY = cursorY

  items
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .forEach((item) => {
      nextY = addPdfParagraph(pdf, `• ${item}`, nextY, { indent: 4, gapAfter: 6 })
    })

  return nextY + 4
}

const addPdfMetaLine = (pdf, label, value, cursorY) => {
  const nextY = ensurePdfSpace(pdf, cursorY, 16)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(80, 80, 80)
  pdf.text(`${label}:`, 48, nextY)

  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(28, 28, 28)
  pdf.text(String(value || '-'), 150, nextY)

  return nextY + 16
}

const generateProposalPdf = (pdf) => {
  let cursorY = 56
  const pageWidth = pdf.internal.pageSize.getWidth()

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(18, 74, 52)
  pdf.text('PROPOSAL PROYEK', pageWidth / 2, cursorY, { align: 'center' })

  cursorY += 24
  pdf.setFontSize(14)
  pdf.setTextColor(28, 28, 28)
  pdf.text(docs.proposal.projectName || 'Proposal Proyek', pageWidth / 2, cursorY, { align: 'center' })

  cursorY += 28
  pdf.setDrawColor(210, 210, 210)
  pdf.line(48, cursorY, pageWidth - 48, cursorY)
  cursorY += 20

  cursorY = addPdfMetaLine(pdf, 'Klien', docs.proposal.clientName || '-', cursorY)
  cursorY = addPdfMetaLine(pdf, 'Versi', `v${docs.proposal.version || '-'}`, cursorY)
  cursorY = addPdfMetaLine(pdf, 'Status', docs.proposal.status || '-', cursorY)
  cursorY = addPdfMetaLine(pdf, 'Terakhir Diupdate', docs.proposal.lastUpdated || '-', cursorY)
  cursorY += 6

  cursorY = addPdfSectionTitle(pdf, 'Ringkasan Eksekutif', cursorY)
  normalizePdfLines(docs.proposal.summary).forEach((line) => {
    cursorY = addPdfParagraph(pdf, line, cursorY)
  })

  cursorY = addPdfSectionTitle(pdf, 'Scope of Work', cursorY)
  cursorY = addPdfBulletList(pdf, normalizePdfLines(docs.proposal.scope), cursorY)

  cursorY = addPdfSectionTitle(pdf, 'Timeline', cursorY)
  cursorY = addPdfParagraph(pdf, docs.proposal.timeline || '-', cursorY)

  cursorY = addPdfSectionTitle(pdf, 'Deliverables', cursorY)
  addPdfBulletList(pdf, docs.proposal.deliverables, cursorY)
}

const generatePenawaranPdf = (pdf, autoTable) => {
  let cursorY = 56
  const pageWidth = pdf.internal.pageSize.getWidth()

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(166, 104, 0)
  pdf.text('SURAT PENAWARAN', pageWidth / 2, cursorY, { align: 'center' })

  cursorY += 22
  pdf.setFontSize(12)
  pdf.setTextColor(28, 28, 28)
  pdf.text(docs.penawaran.number || '-', pageWidth / 2, cursorY, { align: 'center' })

  cursorY += 28
  pdf.setDrawColor(210, 210, 210)
  pdf.line(48, cursorY, pageWidth - 48, cursorY)
  cursorY += 20

  cursorY = addPdfMetaLine(pdf, 'Nama Klien', docs.penawaran.clientName || '-', cursorY)
  cursorY = addPdfMetaLine(pdf, 'Status', docs.penawaran.status || '-', cursorY)
  cursorY = addPdfMetaLine(pdf, 'Berlaku Sampai', formatHumanDate(docs.penawaran.validUntil), cursorY)
  cursorY += 10

  autoTable(pdf, {
    startY: cursorY,
    margin: { left: 48, right: 48 },
    head: [['#', 'Deskripsi Item', 'Harga']],
    body: docs.penawaran.items.map((item, index) => ([
      String(index + 1),
      item.description || '-',
      formatCurrency(item.price),
    ])),
    foot: [['', 'TOTAL', formatCurrency(totalPenawaran.value)]],
    theme: 'grid',
    headStyles: { fillColor: [18, 74, 52], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [243, 244, 246], textColor: [28, 28, 28], fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 6, textColor: [28, 28, 28] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 32 },
      2: { halign: 'right', cellWidth: 120 },
    },
  })

  cursorY = (pdf.lastAutoTable?.finalY || cursorY) + 18
  cursorY = addPdfSectionTitle(pdf, 'Syarat Pembayaran', cursorY)
  normalizePdfLines(docs.penawaran.paymentTerms).forEach((line) => {
    cursorY = addPdfParagraph(pdf, line, cursorY)
  })

  if (docs.penawaran.notes) {
    cursorY = addPdfSectionTitle(pdf, 'Catatan Tambahan', cursorY)
    normalizePdfLines(docs.penawaran.notes).forEach((line) => {
      cursorY = addPdfParagraph(pdf, line, cursorY)
    })
  }
}

const generateAgreementPdf = (pdf) => {
  let cursorY = 56
  const pageWidth = pdf.internal.pageSize.getWidth()

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(18, 74, 52)
  pdf.text('PERJANJIAN KERJASAMA', pageWidth / 2, cursorY, { align: 'center' })

  cursorY += 22
  pdf.setFontSize(12)
  pdf.setTextColor(28, 28, 28)
  pdf.text(docs.agreement.number || '-', pageWidth / 2, cursorY, { align: 'center' })

  cursorY += 28
  pdf.setDrawColor(210, 210, 210)
  pdf.line(48, cursorY, pageWidth - 48, cursorY)
  cursorY += 20

  cursorY = addPdfMetaLine(pdf, 'Status', docs.agreement.status || '-', cursorY)
  cursorY = addPdfMetaLine(pdf, 'Tanggal Efektif', formatHumanDate(docs.agreement.effectiveDate), cursorY)
  cursorY = addPdfMetaLine(pdf, 'Tanggal Berakhir', formatHumanDate(docs.agreement.endDate), cursorY)
  cursorY += 8

  cursorY = addPdfSectionTitle(pdf, 'Para Pihak', cursorY)
  cursorY = addPdfParagraph(pdf, `Pihak Pertama: ${docs.agreement.partyOne.name || '-'} | Alamat: ${docs.agreement.partyOne.address || '-'} | PIC: ${docs.agreement.partyOne.pic || '-'}`, cursorY)
  cursorY = addPdfParagraph(pdf, `Pihak Kedua: ${docs.agreement.partyTwo.name || '-'} | Alamat: ${docs.agreement.partyTwo.address || '-'} | PIC: ${docs.agreement.partyTwo.pic || '-'}`, cursorY)

  cursorY = addPdfSectionTitle(pdf, 'Pasal-Pasal Perjanjian', cursorY)
  docs.agreement.clauses.forEach((clause, index) => {
    cursorY = addPdfParagraph(pdf, `Pasal ${index + 1}: ${clause.title || '-'}`, cursorY, {
      fontSize: 11,
      gapAfter: 8,
      color: [18, 74, 52],
    })

    normalizePdfLines(clause.content).forEach((line) => {
      cursorY = addPdfParagraph(pdf, line, cursorY, { indent: 8 })
    })
  })

  cursorY = addPdfSectionTitle(pdf, 'Penutup', cursorY + 4)
  cursorY = addPdfParagraph(pdf, 'Demikian perjanjian ini dibuat dalam 2 (dua) rangkap bermeterai cukup, masing-masing mempunyai kekuatan hukum yang sama.', cursorY)

  cursorY = ensurePdfSpace(pdf, cursorY, 110)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(90, 90, 90)
  pdf.text('Pihak Pertama', 120, cursorY)
  pdf.text('Pihak Kedua', pageWidth - 180, cursorY)
  pdf.line(80, cursorY + 64, 200, cursorY + 64)
  pdf.line(pageWidth - 220, cursorY + 64, pageWidth - 100, cursorY + 64)
  pdf.setTextColor(28, 28, 28)
  pdf.text(docs.agreement.partyOne.pic || '________________', 140, cursorY + 80, { align: 'center' })
  pdf.text(docs.agreement.partyTwo.pic || '________________', pageWidth - 160, cursorY + 80, { align: 'center' })
}

const saveDocuments = async () => {
  isSaving.value = true
  alertMessage.value = ''
  try {
    docs.proposal.lastUpdated = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    await $fetch('/api/settings', {
      method: 'PUT',
      body: {
        legalDocuments: JSON.stringify({
          proposal: docs.proposal,
          penawaran: docs.penawaran,
          agreement: docs.agreement,
        }),
      },
    })
    alertType.value = 'success'
    alertMessage.value = 'Dokumen berhasil disimpan!'
  } catch {
    alertType.value = 'error'
    alertMessage.value = 'Gagal menyimpan dokumen. Silakan coba lagi.'
  } finally {
    isSaving.value = false
  }
}

const downloadPdf = async () => {
  if (!import.meta.client) return

  isDownloadingPdf.value = true
  alertMessage.value = ''

  try {
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])

    const autoTable = autoTableModule.default
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    pdf.setProperties({
      title: activeTab.value === 'proposal'
        ? 'Proposal Proyek'
        : activeTab.value === 'penawaran'
          ? 'Surat Penawaran'
          : 'Perjanjian Kerjasama',
      subject: 'SignalTribe Legal Documents',
      author: 'SignalTribe',
      creator: 'SignalTribe Admin',
    })

    if (activeTab.value === 'proposal') {
      generateProposalPdf(pdf)
    } else if (activeTab.value === 'penawaran') {
      generatePenawaranPdf(pdf, autoTable)
    } else {
      generateAgreementPdf(pdf)
    }

    pdf.save(`${buildPdfFilename()}.pdf`)
  } catch {
    alertType.value = 'error'
    alertMessage.value = 'Gagal membuat PDF. Silakan coba lagi.'
  } finally {
    isDownloadingPdf.value = false
  }
}
</script>
