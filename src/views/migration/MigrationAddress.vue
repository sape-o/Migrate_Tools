<script setup>
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { onBeforeMount, ref } from 'vue'
import { MigrateGetAddress, uploadFile } from '../../service/migration/MigrationAddress'

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
    files.value = await MigrateGetAddress()
  } catch (err) {
    alert('❌ VUE Failed  to load MigrateGetAddress:', err.message)
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
    alert(`VUE Upload success: ${data.message || 'File uploaded'}`)

    // โหลดข้อมูลใหม่หลัง upload เสร็จ
    files.value = await MigrateGetAddress()
  } catch (err) {
    alert(`VUE Upload failed: ${err.message}`)
  } finally {
    loading.value = false
  }
}

function initFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    filename: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    mimetype: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
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

function onDetail(row) {
  alert(`Show detail for user ID: ${row.user_id}\nFilename: ${row.filename}`)
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
      :globalFilterFields="['filename', 'mimetype', 'status', 'type']"
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
      <Column field="status" header="Status" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <Dropdown v-model="filterModel.value" :options="['active', 'inactive']" placeholder="Select Status" showClear />
        </template>
      </Column>
      <Column field="type" header="Type" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search type" />
        </template>
      </Column>
      <Column header="Action" style="min-width: 12rem" bodyClass="text-center">
        <template #body="{ data }">
          <Button label="Detail" icon="pi pi-info-circle" class="mr-2" text @click="onDetail(data)" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" text @click="onDelete(data)" />
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
</style>
