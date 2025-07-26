<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MigrationDetailID } from '../../service/migration/MigrationAddressGroupDetail.js'

const route = useRoute()
const id = route.params.id

const rows = ref([])
const headers = ref([])
const rowsPerPage = ref(10)

// กำหนด columns ทั้งหมด
const allColumns = [
  { field: 'name', header: 'Name', minWidth: '150px' },
  { field: 'location', header: 'Location', minWidth: '150px' },
  { field: 'members', header: 'Member Count', minWidth: '120px' },
  { field: 'services', header: 'Services', minWidth: '250px' },
  { field: 'tags', header: 'Tags', minWidth: '150px' }
]

// เริ่มต้นให้แสดงทุกคอลัมน์
//const visibleColumns = ref([...allColumns])
const visibleColumns = ref(
  allColumns.filter(col => ['name', 'location', 'members', 'services'].includes(col.field))
)
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  members: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  services: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
})

const filteredRows = ref([])
const exportDialogVisible = ref(false)
const exportDialogType = ref('')

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
        const key = h.toLowerCase().replace(/\s+/g, '_')
        obj[key] = row[i]
      })
      obj.id = row[0] || Math.random().toString(36).substring(2, 9)
      return obj
    })
    filteredRows.value = rows.value.slice()
  } catch (err) {
    alert('Error loading CSV: ' + err.message)
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
  const name = row.name
  const services = row.services

  if (!name || !services) {
    alert('Missing required fields: Name / Services')
    return
  }

  const message = `add name ${name} services ${services}`
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

function onFilter(event) {
  filteredRows.value = event.filteredValue || rows.value
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
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Migration Service Group List</div>

    <div class="flex justify-between items-center flex-wrap mb-3 gap-2">
      <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />
      <div class="flex flex-grow justify-center items-center gap-2">
        <InputText
          v-model="filters.global.value"
          placeholder="ค้นหา..."
          class="w-full max-w-lg"
        />
        <span class="text-gray-600 text-sm whitespace-nowrap">ผลลัพธ์: {{ filteredRows.length }} รายการ</span>
      </div>

      <div class="flex items-center gap-2">
        <!-- MultiSelect เลือกคอลัมน์ -->
        <MultiSelect
          v-model="visibleColumns"
          :options="allColumns"
          optionLabel="header"
          placeholder="เลือกคอลัมน์"
          display="chip"
          class="w-48"
        />
        <Dropdown
          :options="rowsPerPageOptions"
          v-model="rowsPerPage"
          optionLabel="label"
          optionValue="value"
          placeholder="Rows per page"
          class="w-36"
        />
        <Button label="Export Filter CSV" icon="pi pi-file" @click="confirmExportCSV" />
        <Button label="Export Filter Commands" icon="pi pi-code" @click="confirmExportCommands" />
      </div>
    </div>

   
      <DataTable
        :value="rows"
        :paginator="true"
        :rows="rowsPerPage"
        dataKey="id"
        :rowHover="true"
        v-model:filters="filters"
        filterDisplay="menu"
        :filters="filters"
        :globalFilterFields="['name', 'location', 'members', 'services', 'tags']"
        showGridlines
        responsiveLayout="scroll"
        scrollable
        @filter="onFilter"
      >
      <Column
        v-for="col in visibleColumns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :style="{ minWidth: col.minWidth, whiteSpace: 'nowrap', overflowX: 'auto', textOverflow: 'ellipsis' }"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" :placeholder="`Search ${col.header}`" />
        </template>

        <template #body="{ data }">
          <div
            v-if="col.field !== 'services'"
            style="white-space: nowrap; overflow-x: auto; text-overflow: ellipsis;"
          >
            {{ data[col.field] }}
          </div>
          <div
            v-else
            class="address-cell"
            v-html="data.services ? data.services.split(';').map(item => item.trim()).join('<br/>') : ''"
            style="white-space: normal; overflow-wrap: break-word;"
          ></div>
        </template>
      </Column>
        <Column header="Action" style="min-width: 180px" bodyClass="text-center">
          <template #body="{ data }">
            <div class="flex gap-2 justify-center">
              <Button label="CLI" icon="pi pi-code" @click="handleCLI(data)" />
              <Button
                label="PUSH API"
                icon="pi pi-send"
                severity="danger"
                disabled
                @click="onPushAPI(data)"
              />
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

.table-wrapper {
  overflow-x: auto;
  width: 100%;
}
</style>
