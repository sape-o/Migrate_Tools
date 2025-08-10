<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MigrationDetailID } from '../../service/migration/MigrationAddressGroupDetail.js'
import { normalizeServiceName } from '@/utils/migration/normalize_name'

const route = useRoute()
const id = route.params.id

const rows = ref([])
const headers = ref([])
const rowsPerPage = ref(10)
const hasSessionInfoAPI = ref(false)

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

function handleCLICreate(row) {
  let commands = ''

  // ชื่อ group ปรับให้ถูกต้อง
  let groupName = normalizeServiceName(row.name || '', 'Port')
  const destinationPort = row.destination_port || ''

  if (!groupName || !destinationPort) {
    alert('Missing required fields: Name / Destination Port')
    return
  }

  // แยก ports ด้วยเครื่องหมายคอมม่า
  const ports = destinationPort.split(',').map(p => p.trim()).filter(Boolean)
  const serviceNames = []

  ports.forEach((port, index) => {
    // ชื่อ service แต่ละตัว
    const svcName = normalizeServiceName(`${groupName}_${index + 1}`, 'Port')

    // สร้าง service (single port หรือ range)
    commands += `add service ${svcName} port ${port}\n`
    serviceNames.push(svcName)
  })

  // เว้นบรรทัดแล้วสร้าง group
  commands += `\nadd service_group ${groupName} members ${serviceNames.join(',')}\n`

  // แสดงผล
  alert(commands || 'No valid CLI commands generated.')
}

function handleCLI(row) {
  if (!row || !row.name || !row.services) {
    alert('Missing required fields: Group Name / Services list')
    return
  }
  // แปลงเป็น array ถ้าเป็น string
  let serviceList = []
  if (Array.isArray(row.services)) {
    serviceList = row.services
  } else if (typeof row.services === 'string') {
    serviceList = row.services.split(';').map(s => s.trim()).filter(s => s.length > 0)
  } else {
    alert('Services data format is invalid')
    return
  }
  // แก้ชื่อ group ถ้าจำเป็น
  const groupName = /^[0-9]/.test(row.name)
    ? normalizeServiceName(row.name, 'Port')
    : row.name
  // แก้ชื่อ service แต่ละตัวถ้าขึ้นต้นด้วยตัวเลข
  const fixedServices = serviceList.map(svcName => {
    return /^[0-9]/.test(svcName)
      ? normalizeServiceName(svcName, 'Port')
      : svcName
  })
  // สร้างคำสั่ง CLI
  const command = `add service_group ${groupName} members ${fixedServices.join(',')}`
  // แสดงผล
  alert(command)
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
  if (!filteredRows.value || filteredRows.value.length === 0) {
    alert('ไม่มีข้อมูลสำหรับ export')
    return
  }

  const commands = filteredRows.value.map(row => {
    // แก้ชื่อ group ถ้าขึ้นต้นด้วยตัวเลข
    const rawGroupName = row.name || ''
    const groupName = /^[0-9]/.test(rawGroupName)
      ? normalizeServiceName(rawGroupName, 'Port')
      : rawGroupName

    let servicesRaw = row.services || ''
    if (typeof servicesRaw !== 'string') {
      servicesRaw = String(servicesRaw)
    }

    // แยกและ trim members
    const services = servicesRaw
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    // แก้ชื่อ service แต่ละตัวที่ขึ้นต้นด้วยเลข
    const fixedServices = services.map(svcName => {
      return /^[0-9]/.test(svcName)
        ? normalizeServiceName(svcName, 'Port')
        : svcName
    })

    const membersStr = fixedServices.join(', ')

    return `add service-group name ${groupName} members ${membersStr}`
  }).join('\n\n')  // เว้นบรรทัดว่างระหว่างชุดคำสั่งแต่ละกลุ่ม

  const blob = new Blob([commands], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ServiceGroup_Commands_${getTimestampString()}.txt`
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
  </div>
</template>

<style scoped>

.table-wrapper {
  overflow-x: auto;
  width: 100%;
}
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
