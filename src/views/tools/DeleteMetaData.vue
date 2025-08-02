<script setup>
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { onBeforeMount, onMounted, onBeforeUnmount, ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { toolsUploadDeleteMetadata, updateStatusDeleteService, toolsDownloadMetadata, fetchDeleteMetadata } from '../../service/tools/ToolDeleteMetadata'

const confirm = useConfirm()
const toast = useToast()
const radioValue = ref(null)
const colorValue = ref('#000000')
const files = ref([])
const filters = ref(null)
const loading = ref(true)
const selectedRow = ref(null)
const selectedFile = ref(null)
const dialogVisible = ref(false)
const coloropacity = ref(30)
const value = ref(0);
let interval = null;
let intervalId = null

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

onMounted(() => {
  intervalId = setInterval(async () => {
    try {
      files.value = await fetchDeleteMetadata()
    } catch (err) {
      console.error('Interval fetch error:', err)
    }
  }, 8000) // 8 วินาที
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  endProgress()
  selectedFile.value = null
  radioValue.value = null
  colorValue.value = '#000000'
  coloropacity.value = 30
  filters.value = null
  value.value = 0
  dialogVisible.value = false
  selectedRow.value = null
  files.value = []
  loading.value = true
})

function onDialogFileSelected(event) {
  const file = event.target?.files?.[0] || null
  selectedFile.value = file
  startProgress()
  if (file) {
    toast.add({
      severity: 'info',
      summary: 'File Selected',
      detail: `Selected file: ${file.name}`,
      life: 3000
    })
  } else {
    toast.add({
      severity: 'warn',
      summary: 'No File Selected',
      detail: 'Please select a file to upload.',
      life: 3000
    })
  }
}

async function uploadSelectedFile() {
  
  const file = selectedFile.value
  if (!file) {
    toast.add({
      severity: 'warn',
      summary: 'No File Selected',
      detail: 'Please select a file before uploading.',
      life: 3000
    })
    return
  }
  if(radioValue.value === null) {
    toast.add({
      severity: 'warn',
      summary: 'No Action Selected',
      detail: 'Please select an action before uploading.',
      life: 3000
    })
    return
  } else if (radioValue.value === 'colorhighlight' && !colorValue.value) {
    toast.add({
      severity: 'warn',
      summary: 'No Color Selected',
      detail: 'Please select a color for ColorHighlight action.',
      life: 3000
    })
    return
  }

  // เช็คประเภทไฟล์
  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
  const fileExtension = file.name.split('.').pop().toLowerCase()

  if (!allowedExtensions.includes(fileExtension)) {
    toast.add({
      severity: 'warn',
      summary: 'Invalid File',
      detail: `Only PDF, Word, Excel, and PowerPoint files are allowed. You tried to upload a .${fileExtension} file.`,
      life: 4000
    })
    selectedFile.value = null
    return
  }

  loading.value = true
  try {
    
    dialogVisible.value = false
    endProgress()
    const token = getToken()

    let action = radioValue.value
    let opacity = coloropacity.value / 100 // Convert to decimal for opacity
    if (action === 'colorhighlight') {
      action = `highlight_${colorValue.value}`
    }

    const data = await toolsUploadDeleteMetadata(file, action, opacity, token)
    toast.add({ severity: 'success', summary: 'Upload Success', detail: data.message || 'File uploaded', life: 3000 })
    files.value = await fetchDeleteMetadata()
    selectedFile.value = null // reset file
    
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
    
    const originalName = row.file_name || 'file'
    const timestamp = getCurrentTimestamp()

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

function startProgress() {
    interval = setInterval(() => {
        let newValue = value.value + Math.floor(Math.random() * 10) + 1
        if (newValue >= 100) {
            newValue = 100
        }
        value.value = newValue
    }, 30)
}

function endProgress() {
    clearInterval(interval)
    interval = null
    value.value = 0
}

function initFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    file_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    todo: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
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

function onDialogCancel() {
  dialogVisible.value = false
  endProgress()
  selectedFile.value = null
  radioValue.value = null
  colorValue.value = '#000000'
  coloropacity.value = 30

}

</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Uploaded Files</div>
    <DataTable
      :value="files"
      :paginator="true"
      :rows="10"
      dataKey="id"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="menu"
      :loading="loading"
      :filters="filters"
      :globalFilterFields="['file_name','todo']"
      showGridlines
      responsiveLayout="scroll"
    >
      <template #header>
        <div class="flex justify-between items-center gap-3">
          <Button label="UPLOAD FILE" icon="pi pi-upload" @click="dialogVisible = true" />
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
      <Column field="todo" header="To Do" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search todo" />
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
            <Button label="Original" icon="pi pi-file" text disabled="DownloadOriginal(data)" />
            <Button label="Converted" icon="pi pi-file" text @click="Download(data)" />
            <Button label="Delete" icon="pi pi-trash" severity="danger" text @click="confirmDelete(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      header="Upload File"
      v-model:visible="dialogVisible"
      modal
      :style="{ width: '90vw', maxWidth: '500px' }"
    >
    <!-- Radio Button Group -->
      <div class="flex flex-col gap-4">
        <label class="ml-0 sm:ml-2">What Do You Want To Do?</label>
        <!-- Option 1 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <RadioButton id="option1" name="option" value="metadata" v-model="radioValue" />
          <label for="option1" class="ml-0 sm:ml-2"> Delete Metadata</label>
        </div>

        <!-- Option 2 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <RadioButton id="option2" name="option" value="highlight_author" v-model="radioValue" />
          <label for="option2" class="ml-0 sm:ml-2">Delete Highlight Author</label>
        </div>

        <!-- Option 3 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <RadioButton id="option3" name="option" value="colorhighlight" v-model="radioValue"/>
          <label for="option3" class="ml-0 sm:ml-2" :style="{ color: colorValue }">Change Color Highlight</label>
          <ColorPicker format="hex" style="width: 2rem" v-model="colorValue" />
        </div>
      </div>
      <!-- Option 3 -->
      <Transition name="fade">
        <div v-if="radioValue === 'colorhighlight'" class="flex flex-col sm:flex-row sm:items-center gap-2">
          <div class="font-semibold text-xl">Color Opacity</div>
          <Knob v-model="coloropacity" :step="1" :min="1" :max="100" valueTemplate="{value}%" />
        </div>
      </Transition>
      
      
      <div class="p-4 space-y-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <ProgressBar :value="value"></ProgressBar>
          </div>
        </div>
        <!-- File Upload -->
        <input
          ref="customFileInput"
          type="file"
          :accept="radioValue === 'metadata'
            ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
            : '.pdf'"
          class="hidden"
          @change="onDialogFileSelected"
        />
        <Button
          icon="pi pi-upload"
          label="Choose File"
          @click="$refs.customFileInput.click()"
        />
        <div v-if="selectedFile" class="text-sm text-gray-600 truncate mt-1">
          Selected file: {{ selectedFile.name }}
        </div>

          
          

          <!-- Action Buttons -->
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
            <Button label="Cancel" text @click="onDialogCancel" />
            <Button label="Upload" @click="uploadSelectedFile" />
          </div>
      </div>
    </Dialog>

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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
