<script setup>
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { onBeforeMount, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from 'primevue/confirmdialog'
import {
  MigrateGetAddress,
  uploadFile,
  downloadCSVFileAddress,
  updateStatusDeleteAddress
} from '../../service/migration/MigrationAddress'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

const files = ref([])
const filters = ref(null)
const loading = ref(true)
const selectedRow = ref(null)
let intervalId = null

// ฟังก์ชันดึง token จาก localStorage (ปรับตามจริง)
function getToken() {
  return localStorage.getItem('token') || ''
}

onBeforeMount(async () => {
  initFilters()
  try {
    files.value = await MigrateGetAddress()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load files', life: 5000 })
  } finally {
    loading.value = false
  }
})
onMounted(() => {
  intervalId = setInterval(async () => {
    try {
      files.value = await MigrateGetAddress()
    } catch (err) {
      console.error('Interval fetch error:', err)
    }
  }, 5000) // 5 วินาที
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const token = getToken()
  loading.value = true
  try {
    const data = await uploadFile(file, token)
    toast.add({ severity: 'success', summary: 'Upload Success', detail: data.message || 'File uploaded', life: 3000 })

    // โหลดข้อมูลใหม่หลัง upload เสร็จ
    files.value = await MigrateGetAddress()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Upload Failed', detail: err.message, life: 3000 })
  } finally {
    loading.value = false
  }
}

function getCurrentTimestamp() {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`
}

async function exportRowCSV(row) {
  if (!row) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'No data to export', life: 3000 })
    return
  }

  try {
    loading.value = true
    const token = getToken()
    const blob = await downloadCSVFileAddress(row.id, token)

    const baseName = row.filename ? row.filename.replace(/\.[^/.]+$/, '') : 'export'
    const timestamp = getCurrentTimestamp()
    const fileName = `${baseName}_${timestamp}.csv`

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Download Failed', detail: error.message, life: 3000 })
  } finally {
    loading.value = false
  }
}

function initFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    filename: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    mimetype: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    status_delete: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    user_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
  }
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${day}-${month}-${year} ${hours}-${minutes}-${seconds}`
}

async function onDetail(row) {
  await router.push(`/migration/migration-address-detail/${row.id}`)
}

// ใช้ confirm dialog แบบ PrimeVue 3.40+ 
function confirmDelete(row) {
  confirm.require({
    message: `Do you want to delete "${row.filename}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Yes',
    rejectLabel: 'No',
    accept: () => onDelete(row)
  })
}

async function onDelete(row) {
  try {
    const token = getToken()
    loading.value = true
    const res = await updateStatusDeleteAddress(row.id, token)
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.message || 'Failed to delete file')
    }

    selectedRow.value = null // เคลียร์ selectedRow หลังลบสำเร็จ
    files.value = files.value.filter(file => file.id !== row.id) // อัปเดตข้อมูลในตาราง

    toast.add({ severity: 'success', summary: 'Deleted', detail: `File "${row.filename}" deleted`, life: 3000 })

    // โหลดข้อมูลใหม่หลังลบเสร็จ
    files.value = await MigrateGetAddress()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: `Delete failed: ${err.message}`, life: 3000 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Uploaded Files Address</div>
    <DataTable
      :value="files"
      :paginator="true"
      :rows="20"
      dataKey="id"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="menu"
      :loading="loading"
      :filters="filters"
      :globalFilterFields="['filename', 'mimetype', 'type']"
      showGridlines
      responsiveLayout="scroll"
    >
      <template #header>
        <div class="flex justify-between">
          <Button label="Upload File" icon="pi pi-upload" @click="$refs.fileInput.click()" />
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            @change="handleFileUpload"
            accept=".csv"
          />
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
          <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />
        </div>
      </template>

      <Column field="id" header="ID" style="min-width: 1rem" />
      <Column field="filename" header="Filename" style="min-width: 6rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search filename" />
        </template>
      </Column>
      <Column field="mimetype" header="MIME Type" style="min-width: 10rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search mimetype" />
        </template>
      </Column>
      <Column field="upload_date" header="Upload Date" style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDateTime(data.upload_date) }}
        </template>
      </Column>
      <Column field="create_file_time" header="Create File Time" style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDateTime(data.create_file_time) }}
        </template>
      </Column>
      <Column field="type" header="Type" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search type" />
        </template>
      </Column>
      <Column header="Action" style="min-width: 16rem" bodyClass="text-center">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button label="Detail" icon="pi pi-info-circle" text @click="onDetail(data)" />
            <Button label="Export CSV" icon="pi pi-file" text @click="exportRowCSV(data)" />
            <Button label="Delete" icon="pi pi-trash" severity="danger" text @click="confirmDelete(data)" />
          </div>
        </template>
      </Column>
    </DataTable>
    <ConfirmDialog />
  </div>
</template>

<style scoped>
:deep(.p-datatable .pi-check-circle),
:deep(.p-datatable .pi-times-circle) {
  font-size: 1.2rem;
}
.action-buttons {
  display: flex;
  gap: 0.25rem; /* ระยะห่างเล็กๆ ระหว่างปุ่ม */
  justify-content: center; /* จัดกึ่งกลางแนวนอน */
  align-items: center; /* จัดกึ่งกลางแนวตั้ง */
}

.action-buttons >>> .p-button {
  padding: 0.25rem 0.5rem; /* ลด padding ปุ่ม ให้เล็กลง */
  font-size: 0.875rem; /* ขนาดตัวหนังสือเล็กลง */
  min-width: auto; /* ไม่บังคับความกว้าง */
}
</style>
