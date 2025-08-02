<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MigrationDetailID } from '../../service/migration/MigrationAddressDetail.js'

// route param id
const route = useRoute()
const id = route.params.id

const rows = ref([])
const headers = ref([])
const rowsPerPage = ref(10)

// กำหนด columns ทั้งหมด
const allColumns = [
  { field: 'name', header: 'Name', minWidth: '150px' },
  { field: 'location', header: 'Location', minWidth: '150px' },
  { field: 'address', header: 'Addresses', minWidth: '250px' },
  { field: 'tags', header: 'Tags', minWidth: '150px' }
]

// เริ่มต้นให้แสดงทุกคอลัมน์
//const visibleColumns = ref([...allColumns])
const visibleColumns = ref(
  allColumns.filter(col => ['name', 'location', 'address'].includes(col.field))
)
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  location: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  address: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  tags: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
})

const filteredRows = ref([]) // แถวที่กรองแล้ว
const exportDialogVisible = ref(false)
const exportDialogType = ref('') // 'csv' หรือ 'commands'

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
  alert(id)
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
  if (!name || !address) {
    alert('Missing required fields: Name / Address')
    return
  }

  const message = `add name ${name} address ${address}`
  alert(message)
}
function onPushAPI(row) {
  if (confirm(`Are you sure you want to push API for: ${row.name || row.id}?`)) {
    alert(`Pushed API for ${row.name || row.id} (not really implemented)`)
  }
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
                </TabPanel>
                <TabPanel value="1">
                    <div class="font-semibold text-xl mb-4">Migration Address Group Detail Map</div>
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
                </TabPanel>
                <TabPanel value="2">
                    <p class="m-0">
                        Service
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique
                        sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
                        impedit quo minus.
                    </p>
                </TabPanel>
                <TabPanel value="3">
                    <p class="m-0">
                        Service Group
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique
                        sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
                        impedit quo minus.
                    </p>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>

</template>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  padding: 1rem;
}

.address-cell {
  white-space: normal;
  overflow-wrap: break-word;
  max-width: 100%;
}
</style>
