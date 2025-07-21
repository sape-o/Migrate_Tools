<script setup>
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from 'primevue/confirmdialog'
import { toolsUploadDeleteMetadata, updateStatusDeleteService, toolsDownloadMetadata, fetchDeleteMetadata } from '../../service/tools/ToolDeleteMetadata'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

const files = ref([])
const filters = ref(null)
const loading = ref(true)
const selectedRow = ref(null)

function getToken() {
  return localStorage.getItem('token') || ''
}

onBeforeMount(async () => {
  initFilters()
  try {
    files.value = await fetchDeleteMetadata()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load files', life: 3000 })
  } finally {
    loading.value = false
  }
})

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // เช็คนามสกุลไฟล์ที่อนุญาต
  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
  const fileExtension = file.name.split('.').pop().toLowerCase()

  if (!allowedExtensions.includes(fileExtension)) {
    toast.add({
      severity: 'warn',
      summary: 'Invalid File',
      detail: `Only PDF, Word, Excel, and PowerPoint files are allowed. You tried to upload a .${fileExtension} file.`,
      life: 4000
    })
    event.target.value = ''
    return
  }

  loading.value = true
  try {
    const token = getToken()
    const data = await toolsUploadDeleteMetadata(file, token)
    toast.add({ severity: 'success', summary: 'Upload Success', detail: data.message || 'File uploaded', life: 3000 })
    files.value = await fetchDeleteMetadata()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Upload Failed', detail: err.message || err, life: 3000 })
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

async function Download(row) {
  if (!row) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'No data to export', life: 3000 })
    return
  }

  try {
    loading.value = true
    const token = getToken()
    const blob = await toolsDownloadMetadata(row.id, token)
    
    // ใช้นามสกุลไฟล์ต้นฉบับ
    const originalName = row.file_name || 'file'
    const timestamp = getCurrentTimestamp()

    // ไม่ตัดนามสกุลออก เปลี่ยนแค่เพิ่ม timestamp ก่อนนามสกุล
    const lastDotIndex = originalName.lastIndexOf('.')
    const fileName = lastDotIndex !== -1
      ? originalName.slice(0, lastDotIndex) + '_' + timestamp + originalName.slice(lastDotIndex)
      : originalName + '_' + timestamp

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
    file_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
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
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
}

function confirmDelete(row) {
  confirm.require({
    message: `Do you want to delete "${row.file_name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Yes',
    rejectLabel: 'No',
    accept: () => onDelete(row)
  })
}

async function onDelete(row) {
  try {
    loading.value = true
    const token = getToken()
    await updateStatusDeleteService(row.id, token)
    selectedRow.value = null
    files.value = files.value.filter(file => file.id !== row.id)
    toast.add({ severity: 'success', summary: 'Deleted', detail: `File "${row.file_name}" deleted`, life: 3000 })
    files.value = await fetchDeleteMetadata()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: `Delete failed: ${err.message || err}`, life: 3000 })
  } finally {
    loading.value = false
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
      :globalFilterFields="['file_name']"
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
      <Column field="file_name" header="Name" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search name" />
        </template>
      </Column>
      <Column field="created_at" header="Date Create" style="min-width: 14rem">
        <template #body="{ data }">
          {{ formatDateTime(data.created_at) }}
        </template>
      </Column>
      <Column header="Action" style="min-width: 16rem" bodyClass="text-center">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button label="Download" icon="pi pi-file" text @click="Download(data)" />
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
  gap: 0.25rem;
  justify-content: center;
  align-items: center;
}
.action-buttons >>> .p-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  min-width: auto;
}
</style>
