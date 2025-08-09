<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MigrationDetailID } from '../../service/migration/MigrationPolicyDetail.js'

// PrimeVue components
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Dialog from 'primevue/dialog'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const rows = ref([])
const headers = ref([])
const rowsPerPage = ref(10)

const allColumns = [
  { field: 'name', header: 'Name' },
  { field: 'tags', header: 'Tags' },
  { field: 'source_zone', header: 'Source Zone' },
  { field: 'source_address', header: 'Source Address' },
  { field: 'source_user', header: 'Source User' },
  { field: 'source_device', header: 'Source Device' },
  { field: 'destination_zone', header: 'Destination Zone' },
  { field: 'destination_address', header: 'Destination Address' },
  { field: 'destination_device', header: 'Destination Device' },
  { field: 'application', header: 'Application' },
  { field: 'service', header: 'Service' },
  { field: 'action', header: 'Action' },
  { field: 'profile', header: 'Profile' },
  { field: 'options', header: 'Options' },
]

const visibleColumns = ref(
  allColumns.filter(col =>
    ['name', 'source_zone', 'source_address', 'destination_zone', 'destination_address', 'service', 'action'].includes(col.field)
  )
)

function formatCell(field, value) {
  if (
    [
      'name',
      'tags',
      'source_zone',
      'source_address',
      'destination_zone',
      'destination_address',
      'application',
      'service',
      'profile',
      'options',
    ].includes(field)
  ) {
    return value
      ? value
          .split(';')
          .map((part) => part.trim())
          .filter((part) => part !== '')
          .join('<br/>')
      : ''
  }
  return value
}

// Initialize filters structure
const filters = ref({
  global: { value: null, matchMode: 'contains' },
})
allColumns.forEach((col) => {
  filters.value[col.field] = { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
})

const exportDialogVisible = ref(false)
const exportDialogType = ref('')

// Helper: Timestamp string for export file names
function getTimestampString() {
  const d = new Date()
  const [day, month, year, hours, minutes, seconds] = [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ]
  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`
}

function initFilters() {
  Object.keys(filters.value).forEach((key) => {
    if (filters.value[key].constraints) {
      filters.value[key].constraints[0].value = null
    } else {
      filters.value[key].value = null
    }
  })
}

// Clear all filters and reset
function clearFilters() {
  initFilters()
}

// Parse CSV helper
function parseCSV(text) {
  const lines = text.trim().split('\n')
  return lines.map((line) =>
    line
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((cell) => cell.replace(/^"|"$/g, '').trim())
  )
}

// Load data on mount
onMounted(async () => {
  initFilters()
  try {
    const token = localStorage.getItem('token')
    const csvText = await MigrationDetailID(id, token)
    const parsed = parseCSV(csvText)
    headers.value = parsed[0]

    rows.value = parsed.slice(1).map((row) => {
      const obj = {}
      headers.value.forEach((h, i) => {
        const key = h.toLowerCase().replace(/\s+/g, '_')
        obj[key] = row[i]
      })
      obj.id = row[0] || Math.random().toString(36).substring(2, 9)
      return obj
    })
  } catch (err) {
    alert('Error loading CSV: ' + err.message)
    router.push('/pages/empty')
  }
})
function onFilter(event) {
  filteredRows.value = event.filteredValue || rows.value
}
// Live filtered rows computed from rows and filters
const filteredRows = computed(() => {
  function contains(value, filter) {
    if (!filter) return true
    if (!value) return false
    return value.toString().toLowerCase().includes(filter.toLowerCase())
  }

  return rows.value.filter((row) => {
    // Global filter check
    const globalFilter = filters.value.global.value
    if (
      globalFilter &&
      !visibleColumns.value.some((col) =>
        contains(row[col.field], globalFilter)
      )
    )
      return false

    // Check per column filters
    for (const col of allColumns) {
      const f = filters.value[col.field]
      if (f && f.constraints) {
        const val = f.constraints[0].value
        if (val && !contains(row[col.field], val)) {
          return false
        }
      }
    }

    return true
  })
})

// Pagination options
const rowsPerPageOptions = [10, 20, 50, 100, 200].map((v) => ({ label: String(v), value: v }))

// Handle CLI button
function handleCLI(row) {
  const { name = '', type = '', address = '' } = row
  if (!name || !type || !address) return alert('Missing required fields')
  alert(`add name ${name} type ${type} address ${address}`)
}

// Handle PUSH API button (disabled for now)
function onPushAPI(row) {
  if (confirm(`Are you sure you want to push API for: ${row.name || row.id}?`)) {
    alert(`Pushed API for ${row.name || row.id} (not really implemented)`)
  }
}

// Confirm export CSV dialog
function confirmExportCSV() {
  if (!filteredRows.value.length) return alert('ไม่มีข้อมูลสำหรับส่งออก')
  exportDialogType.value = 'csv'
  exportDialogVisible.value = true
}

// Confirm export Commands dialog
function confirmExportCommands() {
  if (!filteredRows.value.length) return alert('ไม่มีข้อมูลสำหรับส่งออก')
  exportDialogType.value = 'commands'
  exportDialogVisible.value = true
}

// Export CSV file
function exportCSV() {
  const csvContent = [
    headers.value.join(','),
    ...filteredRows.value.map((row) =>
      headers.value.map((h) => `"${row[h.toLowerCase().replace(/\s+/g, '_')] || ''}"`).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `Export_Policy_Filter_${getTimestampString()}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
  exportDialogVisible.value = false
}

// Export Commands text file
function exportCommands() {
  const commands = filteredRows.value
    .map((row) => `add name ${row.name || ''} type ${row.type || ''} address ${row.address || ''}`)
    .join('\n')

  const blob = new Blob([commands], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `Export_Policy_Command_${getTimestampString()}.txt`
  link.click()
  URL.revokeObjectURL(link.href)
  exportDialogVisible.value = false
}

// When user confirms export dialog
function onDialogYes() {
  exportDialogType.value === 'csv' ? exportCSV() : exportCommands()
}

// When user cancels export dialog
function onDialogNo() {
  exportDialogVisible.value = false
}
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Migration Service Group List</div>

    <div class="flex justify-between items-center flex-wrap mb-3 gap-2">
      <Button icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilters" />

      <div class="flex flex-grow justify-center items-center gap-2 min-w-[280px]">
        <InputText v-model="filters.global.value" placeholder="ค้นหา..." class="w-full max-w-lg" />
        <span class="text-gray-600 text-sm whitespace-nowrap">ผลลัพธ์: {{ filteredRows.length }} รายการ</span>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <MultiSelect
          v-model="visibleColumns"
          :options="allColumns"
          optionLabel="header"
          placeholder="เลือกคอลัมน์"
          class="w-52"
          display="chip"
          :maxSelectedLabels="2"
        />
        <Dropdown
          :options="rowsPerPageOptions"
          v-model="rowsPerPage"
          optionLabel="label"
          optionValue="value"
          placeholder="Rows per page"
          class="w-36"
        />
        <Button label="Export CSV" icon="pi pi-file" @click="confirmExportCSV" />
        <Button label="Export Cmds" icon="pi pi-code" @click="confirmExportCommands" />
      </div>
    </div>

    <DataTable
      :value="filteredRows"
      autoLayout
      :paginator="true"
      :rows="rowsPerPage"
      dataKey="id"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="menu"
      :filters="filters"
      :globalFilterFields="[
      'name',
      'tags',
      'source_zone',
      'source_address',
      'destination_zone',
      'destination_address',
      'application',
      'service',
      'profile',
      'options',]"
      showGridlines
      responsiveLayout="scroll"
      scrollable
      style="min-width: 100%"
      @filter="onFilter"
    >
      <Column
        v-for="col in visibleColumns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        style="white-space: nowrap; overflow-x: auto; text-overflow: ellipsis; max-width: 400px;"
      >
        <template #body="{ data }">
          <div
            style="white-space: nowrap; overflow-x: auto; text-overflow: ellipsis;"
            v-html="formatCell(col.field, data[col.field])"
          />
        </template>

        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            :placeholder="`Search ${col.header}`"
          />
        </template>
      </Column>

      <Column header="Action" style="min-width: 180px" bodyClass="text-center">
        <template #body="{ data }">
          <div class="flex gap-2 justify-center">
            <Button label="CLI" icon="pi pi-code" @click="handleCLI(data)" />
            <Button label="PUSH API" icon="pi pi-send" severity="danger" disabled @click="onPushAPI(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="exportDialogVisible" header="Confirm Export" modal :closable="false" style="width: 350px">
      <p>Export Filter จำนวน {{ filteredRows.length }} ใช่หรือไม่?</p>
      <div class="flex justify-end gap-3 mt-5">
        <Button label="NO" severity="danger" outlined @click="onDialogNo" />
        <Button label="YES" severity="success" outlined @click="onDialogYes" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>

</style>
