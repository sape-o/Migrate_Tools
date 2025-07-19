<script setup>
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { onBeforeMount, ref } from 'vue'
import { MigrateGetService, uploadFile, downloadCSVFileService } from '../../service/migration/MigrationService'
import { useRouter } from 'vue-router'

const router = useRouter()
const files = ref([])
const filters = ref(null)
const loading = ref(true)

// ฟังก์ชันดึง token จาก localStorage (ปรับตามจริง)
function getToken() {
  return localStorage.getItem('token') || ''
}

onBeforeMount(async () => {
  initFilters()
  try {
    files.value = await MigrateGetService()
  } catch (err) {
    alert('❌ From Fontend onBeforeMount Failed to load MigrateGetService:', err.message)
  } finally {
    loading.value = false
  }
})

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const token = getToken()
  loading.value = true
  try {
    const data = await uploadFile(file, token)
    alert(`From fontend handleFileUpload Upload success: ${data.message || 'File uploaded'}`)

    // โหลดข้อมูลใหม่หลัง upload เสร็จ
    files.value = await MigrateGetService()
  } catch (err) {
    alert(`From Frontend : handleFileUpload -> Upload failed: ${err.message}`)
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
    alert('No data to export')
    return
  }

  try {
    loading.value = true
    const token = getToken()
    const blob = await downloadCSVFileService(row.id, token)

    // ตั้งชื่อไฟล์ ตาม filename ต้นฉบับ + timestamp
    const baseName = row.filename ? row.filename.replace(/\.[^/.]+$/, '') : 'export'
    const timestamp = getCurrentTimestamp()
    const fileName = `${baseName}_${timestamp}.csv`

    // สร้างลิงก์ดาวน์โหลด
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    alert(`From Frontend : exportRowCSV -> Failed to download CSV: ${error.message}`)
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
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

async function onDetail(row) {
    await router.push(`/migration/migration-service-detail/${row.id}`)
}

function onDelete(row) {
  if (confirm(`Are you sure you want to delete file: ${row.filename} ?`)) {
    console.log('Delete', row)
    // เรียก API ลบ หรือโค้ดลบข้อมูล
  }
}
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Uploaded Files</div>
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
          <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" />
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
          <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters" />
        </div>
      </template>

      <Column field="id" header="ID" style="min-width: 6rem" />
      <Column field="filename" header="Filename" style="min-width: 12rem">
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
            <Button label="Delete" icon="pi pi-trash" severity="danger" disabled text @click="onDelete(data)" />
          </div>
        </template>
      </Column>
    </DataTable>
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
