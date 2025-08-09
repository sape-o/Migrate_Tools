<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { cidrToSubnetMask } from '@/utils/migration/networkUtils.js'
import { MigrationDetailID } from '../../service/migration/MigrationAddressDetail.js'
import { addNetwork, addAddressRange, } from '../../service/migration/common/MigrationCheckpointApiNetowrk.js'
import { useSessionInfo } from '../../service/composables/MigrationlocalStorage'

const { hasSessionInfoAPI, sessionInfoIpaddressServer, sessionInfoIpaddress, sessionInfoAPI } = useSessionInfo()

// route param id
const route = useRoute()
const id = route.params.id
const toast = useToast()

const rows = ref([])
const headers = ref([])
const rowsPerPage = ref(10)
const filteredRows = ref([]) // แถวที่กรองแล้ว
const exportDialogVisible = ref(false)
const exportDialogType = ref('') // 'csv' หรือ 'commands'
const displayConfirmationAPI = ref(false)
const selectedRowForAPI = ref(null)

// กำหนด columns ทั้งหมด
const allColumns = [
  { field: 'name', header: 'Name', minWidth: '100px' },
  { field: 'location', header: 'Location', minWidth: '100px' },
  { field: 'type', header: 'Type', minWidth: '100px' },
  { field: 'address', header: 'Addresses', minWidth: '150px' },
  { field: 'tags', header: 'Tags', minWidth: '100px' }
]

// เริ่มต้นให้แสดงทุกคอลัมน์
//const visibleColumns = ref([...allColumns])
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

// ฟังก์ชันตั้งชื่อไฟล์แบบ Address_DD-MM-YYYY_HH-MM-SS
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
        const key = h.toLowerCase().replace(/\s+/g, '_') // เช่น "Member Count" → "member_count"
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
  { label: '200', value: 200 },
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
  const address = row.address
  const type = row.type

  if (!name || !address || !type) {
    alert('Missing required fields: Name / Address / Type')
    return
  }

  let message = ''

  if (type === 'IP Netmask') {
    let ip = address
    let subnet = '255.255.255.255'  // ค่า default

    if (address.includes('/')) {
      const [ipPart, cidrPart] = address.split('/')
      ip = ipPart
      subnet = cidrToSubnetMask(cidrPart) || subnet
    }

    message = `add network name ${name} subnet ${ip} subnet-mask ${subnet}`
  } 
  else if (type === 'IP Range') {
    message = `add address-range name ${name} ip-address ${address.split('-')[0]} to ${address.split('-')[1]}`
  }
  else if (type === 'FQDN') {
    message = `add host name ${name} type domain domain-name ${address}`
  }
  else {
    alert('Unsupported type')
    return
  }

  alert(message)
}


function onPushAPI(row) {
  selectedRowForAPI.value = row
  displayConfirmationAPI.value = true
}

function ConfirmationAPI() {
  try {
    const row = selectedRowForAPI.value
    if (!row) {
      alert('ไม่พบข้อมูล row')
      return
    }

    const { address, name, type } = row

    if (type === 'IP Netmask') {
      let subnet = ''
      let subnetMask = ''

      if (address.includes('/')) {
        const [ip, mask] = address.split('/')
        subnet = ip
        subnetMask = cidrToSubnetMask(mask)
      } else {
        subnet = address
        subnetMask = '255.255.255.255' // เท่ากับ /32
      }

      const payload = {
        name: name,
        subnet: subnet,
        subnet_mask: subnetMask
      }

      addNetwork(sessionInfoIpaddressServer, sessionInfoIpaddress, sessionInfoAPI, payload)
        .then(res => {
          toast.add({
            severity: 'success',
            summary: `Success to push API`,
            detail: `${JSON.stringify(res.addNetwork, null, 2)}`,
            life: 3000,
          })
          toast.add({
            severity: 'success',
            summary: `Success to PUBLIC API`,
            detail: `${JSON.stringify(res.publish, null, 2)}`,
            life: 3000,
          })
        })
        .catch(err => {
          alert('❌ Push API ล้มเหลว: ' + err.message)
        })

    } else if (type === 'IP Range') {
      const [ip_first, ip_last] = address.split('-').map(str => str.trim())

      const payload = {
        name: name,
        ip_first,
        ip_last
      }

      addAddressRange(sessionInfoIpaddressServer, sessionInfoIpaddress, sessionInfoAPI, { rangeData: payload })
        .then(res => {
          toast.add({
            severity: 'success',
            summary: `Success to push API (IP Range)`,
            detail: `${JSON.stringify(res.addAddressRange, null, 2)}`,
            life: 3000,
          })
          toast.add({
            severity: 'success',
            summary: `Success to PUBLIC API (IP Range)`,
            detail: `${JSON.stringify(res.publish, null, 2)}`,
            life: 3000,
          })
        })
        .catch(err => {
          alert('❌ Push API (IP Range) ล้มเหลว: ' + err.message)
        })

    } else if (type === 'FQDN') {
      handleFQDN(row) // Placeholder
    } else {
      alert('❌ ไม่รองรับประเภท: ' + type)
    }

    displayConfirmationAPI.value = false
  } catch (err) {
    alert("catch error: " + err.message)
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
      headers.value.map(h => `"${row[h.toLowerCase().replace(/\s+/g, '_')] || ''}"`).join(',')
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

// ฟังก์ชัน export Commands จริง ๆ
function exportCommands() {
  const commands = filteredRows.value.map(row => {
    const name = row.name || ''
    const type = row.type || ''
    const address = row.address || ''

    if (!name || !type || !address) return null

    if (type === 'IP Netmask') {
      let ip = address
      let subnet = '255.255.255.255'

      if (address.includes('/')) {
        const [ipPart, cidrPart] = address.split('/')
        ip = ipPart
        subnet = cidrToSubnetMask(cidrPart) || subnet
      }

      return `add network name ${name} subnet ${ip} subnet-mask ${subnet}`
    } 
    else if (type === 'IP Range') {
      const [start, end] = address.split('-')
      return `add address-range name ${name} ip-address ${start} to ${end}`
    } 
    else if (type === 'FQDN') {
      return `add host name ${name} type domain domain-name ${address}`
    }

    return `add name ${name} type ${type} address ${address}` // fallback
  })
  .filter(cmd => cmd !== null)
  .join('\n')

  const blob = new Blob([commands], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Address_Command_Filter_${getTimestampString()}.txt`
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
    <div class="font-semibold text-xl mb-4">Migration Address Detail List</div>

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
      :globalFilterFields="['name', 'location', 'address', 'tags']"
      showGridlines
      responsiveLayout="scroll"
      scrollable
      :virtualRowHeight="40"
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
            v-if="col.field !== 'addresses'"
            style="white-space: nowrap; overflow-x: auto; text-overflow: ellipsis;"
          >
            {{ data[col.field] }}
          </div>
          <div
            v-else
            class="address-cell"
            v-html="data.address ? data.address.split(';').map(item => item.trim()).join('<br/>') : ''"
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
</template>

<style scoped>

.address-cell {
  white-space: normal;
  overflow-wrap: break-word;
  max-width: 100%;
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
