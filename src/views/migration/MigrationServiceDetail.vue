<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { normalizeServiceName } from '@/utils/migration/normalize_name'
import { MigrationDetailID } from '../../service/migration/MigrationAddressDetail'
import { useSessionInfo } from '../../service/composables/MigrationlocalStorage'
import { addTcpService } from '../../service/migration/common/MigrationCheckpointApiNetowrk.js'

const { hasSessionInfoAPI, sessionInfoIpaddressServer, sessionInfoIpaddress, sessionInfoAPI } = useSessionInfo()
const toast = useToast()
const route = useRoute()
const id = route.params.id

const rows = ref([])
const headers = ref([])
const rowsPerPage = ref(10)
const displayConfirmationAPI = ref(false)
const selectedRowForAPI = ref(null)
// กำหนด columns ทั้งหมด เพื่อใช้ MultiSelect และแสดงผล
const allColumns = [
  { field: 'name', header: 'Name', minWidth: '150px' },
  { field: 'location', header: 'Location', minWidth: '150px' },
  { field: 'protocol', header: 'Protocol', minWidth: '120px' },
  { field: 'destination_port', header: 'Destination Port', minWidth: '120px' }
]

// เริ่มต้นให้แสดงทุกคอลัมน์
const visibleColumns = ref([...allColumns])

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
  const sessionInfo = localStorage.getItem('sessionInfoAPI')
  hasSessionInfoAPI.value = !!sessionInfo
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

function onPushAPI(row) {
  selectedRowForAPI.value = row
  displayConfirmationAPI.value = true
}
const ConfirmationAPI = async () => {
  try {
    if (!selectedRowForAPI.value) throw new Error('No row selected')

    const { name, destination_port } = selectedRowForAPI.value

    const serviceData = {
      'name': normalizeServiceName(name,'Port'),
      'port': destination_port?.toString()
    }

    const result = await addTcpService(
      sessionInfoIpaddressServer,
      sessionInfoIpaddress,
      sessionInfoAPI,
      serviceData
    )

    toast.add({
      severity: 'success',
      summary: `Success to push Service API`,
      detail: `${JSON.stringify(result.addService, null, 2)}`,
      life: 3000,
    })
    toast.add({
      severity: 'success',
      summary: `Success to PUBLIC API`,
      detail: `${JSON.stringify(result.publish, null, 2)}`,
      life: 3000,
    })
    displayConfirmationAPI.value = false
  } catch (err) {
    console.error('Error:', err.message)
  }
}
function closeConfirmationAPI() {
    displayConfirmationAPI.value = false
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
// ฟังก์ชัน export CSV จริง ๆ
function exportCSV() {
  // ใช้ visibleColumns เพื่อ export เฉพาะคอลัมน์ที่เลือกแสดง
  const selectedHeaders = visibleColumns.value.map(c => c.header)
  const selectedFields = visibleColumns.value.map(c => c.field)

  const csvContent = [
    selectedHeaders.join(','),
    ...filteredRows.value.map(row =>
      selectedFields.map(f => `"${row[f] || ''}"`).join(',')
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
// ฟังก์ชันเปิด dialog ก่อน export Commands
function confirmExportCommands() {
  if (filteredRows.value.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก')
    return
  }
  exportDialogType.value = 'commands'
  exportDialogVisible.value = true
}
// ฟังก์ชัน export Commands จริง ๆ
function exportCommands() {
  const commands = filteredRows.value.flatMap(row => {
    const name = normalizeServiceName(row.name, 'Port') || ''
    const protocol = row.protocol?.toLowerCase() || ''
    const destinationPort = row.destination_port || ''

    if (!name || !protocol || !destinationPort) return []

    if (destinationPort.includes(',')) {
      const ports = destinationPort.split(',').map(p => p.trim())
      const portCommands = ports.map(port => `add service-${protocol} name ${name}_${port} port ${port}`)
      const groupCommand = `add service-group name ${name}_group members ${ports.map(p => `${name}_${p}`).join(', ')}`
      return [...portCommands, groupCommand, '']  // '' เพื่อเว้นบรรทัดว่าง
    }

    if (destinationPort.includes('-')) {
      return [`add service-${protocol} name ${name} port ${destinationPort}`, ''] // เว้นบรรทัดว่าง
    }

    return [`add service-${protocol} name ${name} port ${destinationPort}`, ''] // เว้นบรรทัดว่าง
  }).join('\n')

  const blob = new Blob([commands], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Service_Command_Filter_${getTimestampString()}.txt`
  link.click()
  URL.revokeObjectURL(url)
  exportDialogVisible.value = false
}


function handleCLI(row) {
  const name = normalizeServiceName(row.name, 'Port') || ''
  const protocol = row.protocol?.toLowerCase() || ''
  const destinationPort = row.destination_port || ''

  if (!name || !protocol || !destinationPort) {
    alert('Missing required fields: Name / Protocol / Destination Port')
    return
  }

  let messages = []

  // หลายพอร์ต (comma-separated)
  if (destinationPort.includes(',')) {
    const ports = destinationPort.split(',').map(p => p.trim())
    ports.forEach(port => {
      messages.push(`add service-${protocol} name ${name}_${port} port ${port}`)
    })
    const memberNames = ports.map(port => `${name}_${port}`).join(', ')
    messages.push(`add service-group name ${name}_group members ${memberNames}`)
  }

  // พอร์ตเรนจ์ เช่น 1000-2000
  else if (destinationPort.includes('-')) {
    messages.push(`add service-${protocol} name ${name} port ${destinationPort}`)
  }

  // พอร์ตเดียว
  else {
    messages.push(`add service-${protocol} name ${name} port ${destinationPort}`)
  }

  alert(messages.join('\n'))
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
    <div class="font-semibold text-xl mb-4">Migration Service Detail List</div>

    <div class="flex justify-between items-center flex-wrap mb-3 gap-2">
      <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />

      <div class="flex flex-grow justify-center items-center gap-2">
        <InputText v-model="filters.global.value" placeholder="ค้นหา..." class="w-full max-w-lg" />
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
      :globalFilterFields="['name', 'location', 'protocol', 'destination_port']"
      showGridlines
      responsiveLayout="scroll"
      @filter="onFilter"
    >
      <Column
        v-for="col in visibleColumns.filter(c => c.field !== 'destination_port')"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :style="{ minWidth: col.minWidth, whiteSpace: 'nowrap', overflowX: 'auto', textOverflow: 'ellipsis' }"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" :placeholder="`Search ${col.header}`" />
        </template>
      </Column>

      <!-- แก้ไข destination_port ให้แสดงแบบขึ้นบรรทัดใหม่ -->
      <Column
        field="destination_port"
        header="Destination Port"
        :style="{ minWidth: '120px', whiteSpace: 'normal', wordBreak: 'break-word' }"
      >
        <template #body="{ data }">
          <div>
            <template v-if="data.destination_port && data.destination_port.includes(',')">
              <span v-for="(port, idx) in data.destination_port.split(',')" :key="idx">
                {{ port.trim() }}<template v-if="idx !== data.destination_port.split(',').length -1"><br></template>
              </span>
            </template>
            <template v-else>
              {{ data.destination_port }}
            </template>
          </div>
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search Destination Port" />
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
              :disabled="!hasSessionInfoAPI"
              class="fancy-disabled-button"
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

    <Dialog header="Confirmation" v-model:visible="displayConfirmationAPI" :style="{ width: '350px' }" :modal="true">
      <div class="flex items-center justify-center">
        <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem" />
        <span>Are you sure you want to proceed?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" @click="closeConfirmationAPI" text severity="secondary" />
        <Button label="Yes" icon="pi pi-check" @click="ConfirmationAPI" severity="danger" outlined autofocus />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.fancy-disabled-button:disabled {
  background: repeating-linear-gradient(
    45deg,
    #ff9e9e,
    #ff9e9e 10px,
    #fcdede 10px,
    #fcdede 20px
  );
  color: #8a0000 !important;
  border: 2px dashed #ff4d4d;
  cursor: not-allowed;
  opacity: 0.8;
}

.fancy-disabled-button:disabled:hover {
  transform: scale(1.02);
  box-shadow: 0 0 8px rgba(255, 77, 77, 0.5);
}
</style>
