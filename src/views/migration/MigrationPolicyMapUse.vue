<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { cidrToSubnetMask } from '@/utils/migration/networkUtils.js'
import { getMigrationMappedData } from '../../service/migration/MigrationPolicyMapDetail.js'
import { addNetwork, addAddressRange } from '../../service/migration/common/MigrationCheckpointApiNetowrk.js'
import { useSessionInfo } from '../../service/composables/MigrationlocalStorage'

const { hasSessionInfoAPI, sessionInfoIpaddressServer, sessionInfoIpaddress, sessionInfoAPI } = useSessionInfo()
const route = useRoute()
const validate_id = route.params.id
const toast = useToast()

const address = ref([])
const addressGroups = ref([])
const services = ref([])
const serviceGroups = ref([])
const rowsPerPage = ref(10)
let objetExportFilterCSV = ''
let lengthExport = ''
const exportDialogType = ref('') // 'csv' หรือ 'commands'
const exportDialogVisible = ref(false)
const selectedRowForAPI = ref(null)
const displayConfirmationAPI = ref(false)


// กำหนด columns ที่จะใช้แสดงในตาราง
const allColumnsAddress = [
  { field: 'name', header: 'Name', minWidth: '150px' },
  { field: 'location', header: 'Location', minWidth: '100px' },
  { field: 'type', header: 'Type', minWidth: '100px' },
  { field: 'address', header: 'Address', minWidth: '250px' },
  { field: 'tags', header: 'Tags', minWidth: '150px' },
  { field: 'use', header: 'Use In Group', minWidth: '80px' },
  { field: 'use_in_policy', header: 'Use In Policy', minWidth: '80px' },
  { field: 'use_in_group_policy', header: 'Use In Group Policy', minWidth: '80px' },

]

const allColumnsAddressGroup = [
  { field: 'name', header: 'Name', minWidth: '150px' },
  { field: 'location', header: 'Location', minWidth: '150px' },
  { field: 'members_count', header: 'Member Count', minWidth: '120px' },
  { field: 'addresses', header: 'Addresses', minWidth: '250px' },
  { field: 'tags', header: 'Tags', minWidth: '150px' },
  { field: 'use', header: 'Use In Policy', minWidth: '100px' }
]
const allColumnsService = [
  { field: 'name', header: 'Name', minWidth: '150px' },
  { field: 'location', header: 'Location', minWidth: '150px' },
  { field: 'protocol', header: 'Protocol', minWidth: '100px' },
  { field: 'destination_port', header: 'Destination Port', minWidth: '100px' },
  { field: 'tags', header: 'Tags', minWidth: '150px' },
  { field: 'use', header: 'Use In Group', minWidth: '80px' },
  { field: 'use_in_policy', header: 'Use In Policy', minWidth: '80px' },
  { field: 'use_in_group_policy', header: 'Use In Group Policy', minWidth: '80px' },
  
]

const allColumnsServiceGroup = [
  { field: 'name', header: 'Name', minWidth: '150px' },
  { field: 'location', header: 'Location', minWidth: '150px' },
  { field: 'members', header: 'Member Count', minWidth: '120px' },
  { field: 'services', header: 'Services', minWidth: '250px' },
  { field: 'tags', header: 'Tags', minWidth: '150px' },
  { field: 'use', header: 'Use In Policy', minWidth: '100px' }
]


const visibleColumnsAddress = ref(
  allColumnsAddress.filter(col => ['name', 'location', 'type', 'address', 'use_in_policy', 'use_in_group_policy'].includes(col.field))
)
const visibleColumnsAddressGroup = ref(
  allColumnsAddressGroup.filter(col => ['name', 'location', 'members_count', 'addresses', 'use'].includes(col.field))
)
const visibleColumnsService = ref(
  allColumnsService.filter(col => ['name', 'location', 'protocol', 'destination_port', 'use_in_policy', 'use_in_group_policy'].includes(col.field))
)
const visibleColumnsServiceGroup = ref(
  allColumnsServiceGroup.filter(col => ['name', 'location', 'members', 'services', 'use'].includes(col.field))
)

const filtersAddress = ref({
  global: { value: null, matchMode: 'contains' },
  name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  type: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  address: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  use: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  use_in_policy: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  use_in_group_policy: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
})
const filtersAddressGroup = ref({
  global: { value: null, matchMode: 'contains' },
  name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  members_count: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  addresses: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  use: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
})
const filtersService = ref({
  global: { value: null, matchMode: 'contains' },
  name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  protocol: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  destination_port: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  use: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  use_in_policy: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  use_in_group_policy: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  
})
const filtersServiceGroup = ref({
  global: { value: null, matchMode: 'contains' },
  name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  members_count: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  addresses: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  use: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
})

const filteredRowsAddress = ref([])
const filteredRowsAddressGroup = ref([])
const filteredRowsService = ref([])
const filteredRowsServiceGroup = ref([])
const rowsPerPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

function initFilters() {
  // เคลียร์ filter ทั้ง 4 ชุด
  filtersAddress.value = {
    global: { value: null, matchMode: 'contains' },
    name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    type: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    address: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    use: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    use_in_policy: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    use_in_group_policy: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
  }
  filtersAddressGroup.value = {
    global: { value: null, matchMode: 'contains' },
    name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    members_count: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    addresses: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    use: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  }
  filtersService.value = {
    global: { value: null, matchMode: 'contains' },
    name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    protocol: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    destination_port: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    use: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    use_in_policy: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    use_in_group_policy: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  }
  filtersServiceGroup.value = {
    global: { value: null, matchMode: 'contains' },
    name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    members: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    addresses: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
    use: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
  }
}

onMounted(async () => {
  initFilters()
  try {
    const token = localStorage.getItem('token')
    const data = await getMigrationMappedData(validate_id, token)
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: `Load Success Time : ${data.time_process}`,
        detail: `Loaded ${data.addresses.length} addresses`,
        life: 3000,
      })
      // ใช้เฉพาะ addresses ตอนนี้
      address.value = data.addresses
      addressGroups.value = data.addressGroups
      services.value = data.services
      serviceGroups.value = data.serviceGroups
      filteredRowsAddress.value = data.addresses
      filteredRowsAddressGroup.value = data.addressGroups
      filteredRowsService.value = data.services
      filteredRowsServiceGroup.value = data.serviceGroups
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Load failed',
        detail: data.message || 'No data',
        life: 3000,
      })
    }
    objetExportFilterCSV = ''
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message,
      life: 5000,
    })
  }
})

function onFilterAddress(event) {
  filteredRowsAddress.value = event.filteredValue || address.value
}
function onFilterAddressGroup(event) {
  filteredRowsAddressGroup.value = event.filteredValue || addressGroups.value
}
function onFilterService(event) {
  filteredRowsService.value = event.filteredValue || services.value
}
function onFilterServiceGroup(event) {
  filteredRowsServiceGroup.value = event.filteredValue || servicesGroup.value
}
function rowClassRed(data) {
  let classes = []

  if (data.use === 0 || data.use === '0') {
    classes.push('row-line-through')
  }

  if (data.use_in_group_policy === 0 || data.use_in_group_policy === '0') {
    classes.push('text-red-600', 'line-through')
  }

  return classes.join(' ')
}


const addressCLI = async (id) => {
  alert("CLI"+JSON.stringify(id))
}

const addressAPI = async (row) => {
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

function confirmExportFilterCSV(type) {
  objetExportFilterCSV = type
  if(type === 'Address') {
    if (filteredRowsAddress.value.length !== 0) {
      lengthExport = filteredRowsAddress.value.length
      exportDialogType.value = 'csv'
      exportDialogVisible.value = true
    } else {
      alert('No data to export')
    }
  } else if (type === 'Address Group') {
    if (filteredRowsAddressGroup.value.length !== 0) {
      lengthExport = filteredRowsAddressGroup.value.length
      exportDialogType.value = 'csv'
      exportDialogVisible.value = true
    } else {
      alert('No data to export')
    }
  } else if (type === 'Service') {
    if (filteredRowsService.value.length !== 0) {
      lengthExport = filteredRowsService.value.length
      exportDialogType.value = 'csv'
      exportDialogVisible.value = true
    } else {
      alert('No data to export')
    }
  }else if (type === 'Service Group') {
    if (filteredRowsServiceGroup.value.length !== 0) {
      lengthExport = filteredRowsServiceGroup.value.length
      exportDialogType.value = 'csv'
      exportDialogVisible.value = true
    } else {
      alert('No data to export')
    }
  }
  
}

function confirmExportFilterCommands() {
  if (filteredRowsAddress.value.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก'+objetExportFilterCSV)
    return
  }
  exportDialogType.value = 'commands'
  exportDialogVisible.value = true
}


function OnDialogYes() {
  if (exportDialogType.value === 'csv') {
    exportCSV()  
  } else if (exportDialogType.value === 'commands') {
    exportCommands()
  }
}
function OnDialogNo() {
  objetExportFilterCSV = ''
  exportDialogVisible.value = false
}

// ฟังก์ชัน export CSV จริง ๆ
function exportCSV() {
  const csvContent = [
    headers.value.join(','),
    ...filteredRowsAddress.value.map(row =>
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
  const commands = filteredRowsAddress.value.map(row => {
    const name = row.name || ''
    const type = row.type || ''
    const address = row.address || ''
    return `add name ${name} type ${type} address ${address}`
  }).join('\n')

  const blob = new Blob([commands], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Address_Command_Filter_${getTimestampString()}.txt`
  link.click()
  URL.revokeObjectURL(url)
  exportDialogVisible.value = false
}



</script>

<template>
  <div class="card flex flex-col w-full">
      <div class="font-semibold text-xl mb-4">DETAILS</div>
      <Tabs value="0">
          <TabList>
              <Tab value="0">Address</Tab>
              <Tab value="1">Address Group</Tab>
              <Tab value="2">Service</Tab>
              <Tab value="3">Service Group</Tab>
          </TabList>
          <TabPanels>
              <TabPanel value="0">
                  <div class="font-semibold text-xl mb-4">Migration Address  Detail Map</div>
                  <div class="flex justify-between items-center flex-wrap mb-3 gap-2">
                  <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />

                  <div class="flex flex-grow justify-center items-center gap-2">
                      <InputText
                      v-model="filtersAddress.global.value"
                      placeholder="ค้นหา..."
                      class="w-full max-w-lg"
                      />
                      <span class="text-gray-600 text-sm whitespace-nowrap">ผลลัพธ์: {{ filteredRowsAddress.length }} รายการ</span>
                  </div>

                  <div class="flex items-center gap-2">
                      <!-- MultiSelect เลือกคอลัมน์ -->
                      <MultiSelect
                      v-model="visibleColumnsAddress"
                      :options="allColumnsAddress"
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

                      <Button label="Export Filter CSV" icon="pi pi-file" @click="confirmExportFilterCSV('Address')" />
                      <Button label="Export Filter Commands" icon="pi pi-code" @click="confirmExportFilterCommands('Address')" />
                  </div>
                  </div>

                  <DataTable
                  :value="address"
                  :paginator="true"
                  :rows="rowsPerPage"
                  dataKey="id"
                  :rowHover="true"
                  v-model:filters="filtersAddress"
                  filterDisplay="menu"
                  :filters="filtersAddress"
                  :globalFilterFields="['name', 'location', 'type', 'address', 'tags', 'use', 'use_in_policy','use_in_group_policy']"
                  showGridlines
                  responsiveLayout="scroll"
                  scrollable
                  @filter="onFilterAddress"
                  :rowClass="rowClassRed"
                  >
                  <Column
                      v-for="col in visibleColumnsAddress"
                      :key="col.field"
                      :field="col.field"
                      :header="col.header"
                      :style="{ minWidth: col.minWidth, whiteSpace: 'nowrap', overflowX: 'auto', textOverflow: 'ellipsis' }"
                  >
                      <template #filter="{ filterModel }">
                      <InputText v-model="filterModel.value" :placeholder="`Search ${col.header}`" />
                      </template>

                  </Column>

                  <Column header="Action" style="min-width: 180px" bodyClass="text-center action-cell">
                    <template #body="{ data }">
                      <div class="flex gap-2 justify-center">
                        <Button label="CLI" icon="pi pi-code" @click="addressCLI(data)" />
                        <Button
                          label="PUSH API"
                          icon="pi pi-send"
                          severity="danger"
                          :disabled="!hasSessionInfoAPI"
                          @click="addressAPI(data)"
                        />
                      </div>
                    </template>
                  </Column>
                  </DataTable>

              </TabPanel>

              <TabPanel value="1">
                  <div class="font-semibold text-xl mb-4">Migration Address Group Detail Map</div>
                  <div class="flex justify-between items-center flex-wrap mb-3 gap-2">
                  <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />

                  <div class="flex flex-grow justify-center items-center gap-2">
                      <InputText
                      v-model="filtersAddressGroup.global.value"
                      placeholder="ค้นหา..."
                      class="w-full max-w-lg"
                      />
                      <span class="text-gray-600 text-sm whitespace-nowrap">ผลลัพธ์: {{ filteredRowsAddressGroup.length }} รายการ</span>
                  </div>

                  <div class="flex items-center gap-2">
                      <!-- MultiSelect เลือกคอลัมน์ -->
                      <MultiSelect
                      v-model="visibleColumnsAddressGroup"
                      :options="allColumnsAddressGroup"
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

                      <Button label="Export Filter CSV" icon="pi pi-file" @click="confirmExportFilterCSV('Address Group')" />
                      <Button label="Export Filter Commands" icon="pi pi-code" @click="confirmExportFilterCommands('Address Group')" />
                  </div>
                  </div>

                  <DataTable
                  :value="addressGroups"
                  :paginator="true"
                  :rows="rowsPerPage"
                  dataKey="id"
                  :rowHover="true"
                  v-model:filters="filtersAddressGroup"
                  filterDisplay="menu"
                  :filters="filtersAddressGroup"
                  :globalFilterFields="['name', 'location', 'members_count', 'addresses', 'tags', 'use']"
                  showGridlines
                  responsiveLayout="scroll"
                  scrollable
                  :virtualRowHeight="40"
                  @filter="onFilterAddressGroup"
                  >
                  <Column
                      v-for="col in visibleColumnsAddressGroup"
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
                          v-html="data.addresses ? data.addresses.split(';').map(item => item.trim()).join('<br/>') : ''"
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

              </TabPanel>

              <TabPanel value="2">
                  <div class="font-semibold text-xl mb-4">Migration Service Detail Map</div>
                  <div class="flex justify-between items-center flex-wrap mb-3 gap-2">
                    <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />

                    <div class="flex flex-grow justify-center items-center gap-2">
                      <InputText v-model="filtersService.global.value" placeholder="ค้นหา..." class="w-full max-w-lg" />
                      <span class="text-gray-600 text-sm whitespace-nowrap">ผลลัพธ์: {{ filteredRowsService.length }} รายการ</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <!-- MultiSelect เลือกคอลัมน์ -->
                      <MultiSelect
                        v-model="visibleColumnsService"
                        :options="allColumnsService"
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

                      <Button label="Export Filter CSV" icon="pi pi-file" @click="confirmExportFilterCSV('Service')" />
                      <Button label="Export Filter Commands" icon="pi pi-code" @click="confirmExportFilterCommands('Service')" />
                    </div>
                  </div>

                  <DataTable
                    :value="services"
                    :paginator="true"
                    :rows="rowsPerPage"
                    dataKey="id"
                    :rowHover="true"
                    v-model:filters="filtersService"
                    filterDisplay="menu"
                    :filters="filtersService"
                    :globalFilterFields="['name', 'location', 'protocol', 'destination_port', 'tags', 'use', 'use_in_policy', 'use_in_group_policy']"
                    showGridlines
                    responsiveLayout="scroll"
                    @filter="onFilterService"
                  >
                    <Column
                      v-for="col in visibleColumnsService"
                      :key="col.field"
                      :field="col.field"
                      :header="col.header"
                      :style="{ minWidth: col.minWidth, whiteSpace: 'nowrap', overflowX: 'auto', textOverflow: 'ellipsis' }"
                    >
                      <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" :placeholder="`Search ${col.header}`" />
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

              </TabPanel>

              <TabPanel value="3">
                  <div class="font-semibold text-xl mb-4">Migration Service Group Map</div>
                  <div class="flex justify-between items-center flex-wrap mb-3 gap-2">
                    <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />
                    <div class="flex flex-grow justify-center items-center gap-2">
                      <InputText
                        v-model="filtersServiceGroup.global.value"
                        placeholder="ค้นหา..."
                        class="w-full max-w-lg"
                      />
                      <span class="text-gray-600 text-sm whitespace-nowrap">ผลลัพธ์: {{ filteredRowsServiceGroup.length }} รายการ</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <!-- MultiSelect เลือกคอลัมน์ -->
                      <MultiSelect
                        v-model="visibleColumnsServiceGroup"
                        :options="allColumnsServiceGroup"
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
                      <Button label="Export Filter CSV" icon="pi pi-file" @click="confirmExportFilterCSV('Service Group')" />
                      <Button label="Export Filter Commands" icon="pi pi-code" @click="confirmExportFilterCommands('Service Group')" />
                    </div>
                  </div>

                
                    <DataTable
                      :value="serviceGroups"
                      :paginator="true"
                      :rows="rowsPerPage"
                      dataKey="id"
                      :rowHover="true"
                      v-model:filters="filtersServiceGroup"
                      filterDisplay="menu"
                      :filters="filtersServiceGroup"
                      :globalFilterFields="['name', 'location', 'members', 'services', 'tags', 'use']"
                      showGridlines
                      responsiveLayout="scroll"
                      scrollable
                      @filter="onFilterServiceGroup"
                    >
                    <Column
                      v-for="col in visibleColumnsServiceGroup"
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
              </TabPanel>
          </TabPanels>
      </Tabs>
      <Dialog
        v-model:visible="exportDialogVisible"
        header="Confirm Export"
        modal
        :closable="false"
        style="width: 350px"
      >
        <p>Export {{ objetExportFilterCSV }} Filter จำนวน {{ lengthExport }} ใช่หรือไม่?</p>
        <div class="flex justify-end gap-3 mt-5">
          <Button label="NO" severity="danger" outlined @click="OnDialogNo" />
          <Button label="YES" severity="success" outlined @click="OnDialogYes" />
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
.row-zero-use {
  background-color: #ec2d2d !important; 
}
.address-cell {
  white-space: normal;
  overflow-wrap: break-word;
  max-width: 100%;
}
/* ยกเว้นการขีดฆ่า และ สีแดงสำหรับคอลัมน์ที่มี class นี้ */
.no-line-through {
  text-decoration: none !important;
  color: inherit !important;
}
.row-line-through {
  text-decoration: line-through;
  color: red;
}

.action-cell {
  text-decoration: none !important;
  color: inherit !important;
}

.row-line-through .action-cell {
  text-decoration: none !important;
  color: inherit !important; /* ยกเลิกสีแดงในคอลัมน์ Action */
}
</style>
