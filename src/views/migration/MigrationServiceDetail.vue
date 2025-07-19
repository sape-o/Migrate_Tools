<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MigrationDetailID } from '../../service/migration/MigrationAddressDetail'

const route = useRoute()
const id = route.params.id

const rows = ref([])
const headers = ref([])
const rowsPerPage = ref(10)

const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  protocol: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  destination_port: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
})

const filteredRows = ref([])

// dialog control
const exportDialogVisible = ref(false)
const exportDialogType = ref('') // 'csv' หรือ 'commands'

// ตั้งชื่อไฟล์แบบ Address_DD-MM-YYYY_HH-MM-SS
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
        obj[h.toLowerCase().replace(/ /g, '_')] = row[i]
      })
      obj.id = Math.random().toString(36).substring(2, 9)
      return obj
    })

    filteredRows.value = [...rows.value]
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

// ฟังก์ชันเปิด dialog ก่อน export CSV
function confirmExportCSV() {
  if (filteredRows.value.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก')
    return
  }
  exportDialogType.value = 'csv'
  exportDialogVisible.value = true
}

// ฟังก์ชันเปิด dialog ก่อน export Commands
function confirmExportCommands() {
  if (filteredRows.value.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก')
    return
  }
  exportDialogType.value = 'commands'
  exportDialogVisible.value = true
}

// ฟังก์ชัน export CSV จริง ๆ
function exportCSV() {
  const csvContent = [
    headers.value.join(','),
    ...filteredRows.value.map(row =>
      headers.value.map(h => `"${row[h.toLowerCase().replace(/ /g, '_')] || ''}"`).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Address_${getTimestampString()}.csv`
  link.click()
  URL.revokeObjectURL(url)
  exportDialogVisible.value = false
}

// ฟังก์ชัน export Commands จริง ๆ
function exportCommands() {
  const commands = filteredRows.value.map(row => {
    const name = row.name || ''
    const protocol = row.protocol || ''
    const destinationPort = row.destination_port || ''
    return `add name ${name} protocol ${protocol} Destinationport ${destinationPort}`
  }).join('\n')

  const blob = new Blob([commands], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Address_Commands_${getTimestampString()}.txt`
  link.click()
  URL.revokeObjectURL(url)
  exportDialogVisible.value = false
}

function handleCLI(row) {
  const name = row.name || ''
  const protocol = row.protocol || ''
  const destinationPort = row.destination_port || ''

  if (!name || !protocol || !destinationPort) {
    alert('Missing required fields: Name / Protocol / Destination Port')
    return
  }

  const message = `add name ${name} protocol ${protocol} Destinationport ${destinationPort}`
  alert(message)
}

function onFilter(event) {
  filteredRows.value = event.filteredValue || rows.value
}

// dialog ปุ่ม Yes กดแล้ว export
function onDialogYes() {
  if (exportDialogType.value === 'csv') {
    exportCSV()
  } else if (exportDialogType.value === 'commands') {
    exportCommands()
  }
}

// dialog ปุ่ม No กดแล้วปิด dialog
function onDialogNo() {
  exportDialogVisible.value = false
}
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Migration Address List</div>

    <div class="flex justify-between items-center flex-wrap mb-3 gap-2">
      <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />
      <div class="flex flex-grow justify-center items-center gap-2">
        <InputText v-model="filters.global.value" placeholder="ค้นหา..." class="w-full max-w-lg" />
        <span class="text-gray-600 text-sm whitespace-nowrap">ผลลัพธ์: {{ filteredRows.length }} รายการ</span>
      </div>
      <div class="flex items-center gap-2">
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
      :globalFilterFields="['name', 'location', 'protocol', 'destination_port']"
      showGridlines
      responsiveLayout="scroll"
      @filter="onFilter"
    >
      <Column field="name" header="Name" style="min-width: 150px">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search Name" />
        </template>
      </Column>

      <Column field="location" header="Location" style="min-width: 150px">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search Location" />
        </template>
      </Column>

      <Column field="protocol" header="Protocol" style="min-width: 120px">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search Protocol" />
        </template>
      </Column>
      <Column field="destination_port" header="Destination Port" style="min-width: 120px; max-width: 180px;">
        <template #body="{ data }">
          <div style="white-space: normal; word-break: break-word;">
            {{ data.destination_port }}
          </div>
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search Port" />
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
</style>
