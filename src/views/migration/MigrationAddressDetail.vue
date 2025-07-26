<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MigrationDetailID } from '../../service/migration/MigrationAddressDetail'

// Import PrimeVue components
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
  { field: 'location', header: 'Location' },
  { field: 'type', header: 'Type' },
  { field: 'address', header: 'Address' },
  { field: 'tags', header: 'Tags' }
]

const visibleColumns = ref(
  allColumns.filter(col => ['name', 'location', 'type', 'address'].includes(col.field))
)

const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  type: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  address: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
})

const filteredRows = ref([])

const exportDialogVisible = ref(false)
const exportDialogType = ref('')

// สำหรับเก็บข้อความค้นหาแบบ global
const searchTerm = ref('')

// debounce function
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// ฟังก์ชันกรองข้อมูลโดย global search term
function filterRows() {
  if (!searchTerm.value) {
    filteredRows.value = rows.value.slice()
  } else {
    const term = searchTerm.value.toLowerCase()
    filteredRows.value = rows.value.filter(row => {
      return allColumns.some(col => {
        const cell = (row[col.field] || '').toString().toLowerCase()
        return cell.includes(term)
      })
    })
  }
}

// ใช้ debounce กันพิมพ์เร็วเกินไป 300ms
const debouncedFilterRows = debounce(filterRows, 300)

// เรียก debounce เมื่อ input change
function onSearchInput() {
  debouncedFilterRows()
}

function getTimestampString() {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`
}

function initFilters() {
  Object.keys(filters.value).forEach(key => {
    if (filters.value[key].constraints) {
      filters.value[key].constraints[0].value = null
    } else {
      filters.value[key].value = null
    }
  })
}

onMounted(async () => {
  initFilters()
  try {
    const token = localStorage.getItem('token')
    const csvText = await MigrationDetailID(id, token)
    const parsed = parseCSV(csvText)
    headers.value = parsed[0]

    rows.value = parsed.slice(1).map(row => {
      const obj = {}
      headers.value.forEach((h, i) => {
        obj[h.toLowerCase()] = row[i]
      })
      obj.id = row[0] || Math.random().toString(36).substring(2, 9)
      return obj
    })
    filteredRows.value = rows.value.slice()
  } catch (err) {
    alert('Error loading CSV: ' + err.message)
    router.push('/pages/empty')
  }
})

const rowsPerPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 }
]

function parseCSV(text) {
  const lines = text.trim().split('\n')
  return lines.map(line =>
    line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell =>
      cell.replace(/^"|"$/g, '').trim()
    )
  )
}

function handleCLI(row) {
  const name = row.name || ''
  const type = row.type || ''
  const address = row.address || ''

  if (!name || !type || !address) {
    alert('Missing required fields: Name / Type / Address')
    return
  }

  const message = `add name ${name} type ${type} address ${address}`
  alert(message)
}
function onPushAPI(row) {
  if (confirm(`Are you sure you want to push API for: ${row.name || row.id}?`)) {
    alert(`Pushed API for ${row.name || row.id} (not really implemented)`)
  }
}

function confirmExportCSV() {
  if (filteredRows.value.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก')
    return
  }
  exportDialogType.value = 'csv'
  exportDialogVisible.value = true
}

function confirmExportCommands() {
  if (filteredRows.value.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก')
    return
  }
  exportDialogType.value = 'commands'
  exportDialogVisible.value = true
}

function exportCSV() {
  const csvContent = [
    headers.value.join(','),
    ...filteredRows.value.map(row =>
      headers.value.map(h => `"${row[h.toLowerCase()] || ''}"`).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Address_Filter_${getTimestampString()}.csv`
  link.click()
  URL.revokeObjectURL(url)
  exportDialogVisible.value = false
}

function exportCommands() {
  const commands = filteredRows.value.map(row => {
    const name = row.name || ''
    const type = row.type || ''
    const address = row.address || ''
    return `add name ${name} type ${type} address ${address}`
  }).join('\n')

  const blob = new Blob([commands], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Address_${getTimestampString()}.txt`
  link.click()
  URL.revokeObjectURL(url)
  exportDialogVisible.value = false
}

function onDialogYes() {
  if (exportDialogType.value === 'csv') {
    exportCSV()
  } else if (exportDialogType.value === 'commands') {
    exportCommands()
  }
}

function onDialogNo() {
  exportDialogVisible.value = false
}

function formatAddress(text) {
  if (!text) return ''
  return text.split(';').map(p => p.trim()).join('<br/>')
}
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Migration Address List Detail</div>

    <div class="flex flex-wrap justify-between items-center mb-3 gap-2">
      <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />

      <div class="flex flex-grow justify-center items-center gap-2 min-w-[280px]">
        <InputText
          v-model="searchTerm"
          placeholder="ค้นหา..."
          class="w-full max-w-lg"
          @input="onSearchInput"
        />
        <span class="text-gray-600 text-sm whitespace-nowrap">ผลลัพธ์: {{ filteredRows.length }} รายการ</span>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- MultiSelect เลือกคอลัมน์ -->
        <MultiSelect
          v-model="visibleColumns"
          :options="allColumns"
          optionLabel="header"
          placeholder="เลือกคอลัมน์"
          class="w-48"
          display="chip"
          :maxSelectedLabels="2"
        />

        <!-- Dropdown เลือก Rows per page -->
        <Dropdown
          :options="rowsPerPageOptions"
          v-model="rowsPerPage"
          optionLabel="label"
          optionValue="value"
          placeholder="Rows per page"
          class="w-28"
        />

        <!-- ปุ่มเดิม -->
        <Button label="Export Filter CSV" icon="pi pi-file" @click="confirmExportCSV" />
        <Button label="Export Filter Commands" icon="pi pi-code" @click="confirmExportCommands" />
      </div>
    </div>

    <DataTable
      :value="filteredRows"
      :paginator="true"
      :rows="rowsPerPage"
      dataKey="id"
      :rowHover="true"
      filterDisplay="menu"
      showGridlines
      responsiveLayout="scroll"
      class="min-w-full"
    >
      <Column
        v-for="col in visibleColumns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :style="{ maxWidth: '200px', wordBreak: 'break-word', whiteSpace: 'normal' }"
      >
        <template #body="{ data }">
          <span v-if="col.field === 'address'" v-html="formatAddress(data[col.field])"></span>
          <span v-else>{{ data[col.field] }}</span>
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

    <Dialog
      v-model:visible="exportDialogVisible"
      header="Confirm Export"
      modal
      :closable="false"
      style="width: 350px"
    >
      <p>Export Filter จำนวน {{ filteredRows.length }} ใช่หรือไม่?</p>
      <div class="flex justify-end gap-3 mt-5">
        <Button label="NO" severity="danger" outlined @click="onDialogNo" />
        <Button label="YES" severity="success" outlined @click="onDialogYes" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  padding: 1rem;
}
</style>
