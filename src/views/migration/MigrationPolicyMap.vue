<script setup>
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import {
 MigrateGetPolicyMapPolicy,
 MigrateGetPolicyMapAddress,
 MigrateGetPolicyMapAddressGroup,
 MigrateGetPolicyMapService,
 MigrateGetPolicyMapServiceGroup,
 validatePolicyMap,
 MigrateFetchValidatePolicyMap,
 updateStatusDelteMigrateGetPolicyMap
} from '../../service/migration/MigrationPolicyMap'

const router = useRouter()
const toast = useToast()

const filesPolicy = ref([])
const filesAddress = ref([])
const filesAddressGroup = ref([])
const filesService = ref([])
const filesServiceGroup = ref([])
const fetch = ref([])
const filters = ref({})
const loading = ref(true)

const dropdownPolicy = ref(null)
const dropdownAddress = ref(null)
const dropdownAddressGroup = ref(null)
const dropdownService = ref(null)
const dropdownServiceGroup = ref(null)

const dropdownPolicys = ref([])
const dropdownAddresses = ref([])
const dropdownAddressGroups = ref([])
const dropdownServices = ref([])
const dropdownServiceGroups = ref([])

// ฟังก์ชันดึง token จาก localStorage (ปรับตามจริง)
function getToken() {
  return localStorage.getItem('token') || ''
}

onBeforeMount(async () => {
  initFilters()
  try {
    const res = await MigrateFetchValidatePolicyMap()
    fetch.value = res.services || [] // ถ้าไม่มี services ให้ fallback เป็น array ว่าง
    await loadPolicyMapPolicy()
    await loadPolicyMapAddress()
    await loadPolicyMapAddressGroup()
    await loadPolicyMapService()
    await loadPolicyMapServiceGroup()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load initial data',
      life: 5000
    })
  } finally {
    loading.value = false
  }
  await loadPolicyMapPolicy()
  await loadPolicyMapAddress()
  await loadPolicyMapAddressGroup()
  await loadPolicyMapService()
  await loadPolicyMapServiceGroup()
})
onMounted( async () => {
  try {
    const res = await MigrateFetchValidatePolicyMap()
    fetch.value = res.services || [] // ถ้าไม่มี services ให้ fallback เป็น array ว่าง
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch initial data',
      life: 5000
    })
  } finally {
    loading.value = false
  }
})


function initFilters() {
  resetDropdown()
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    policy_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    address_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    address_group_name: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    service_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    validate_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
  }
}

const loadPolicyMapPolicy = async () => {
  try {
    const response = await MigrateGetPolicyMapPolicy()
    filesPolicy.value = response.policies
    dropdownPolicys.value = response.policies.map(file => ({
      name: file.filename,
      code: file.id
    }))
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load files Policy',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
const loadPolicyMapAddress = async () => {
  try {
    const response = await MigrateGetPolicyMapAddress()
    filesAddress.value = response.addresses
    dropdownAddresses.value = response.addresses.map(file => ({
      name: file.filename,
      code: file.id
    }))
    
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load files Address',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
const loadPolicyMapAddressGroup = async () => {
  try {
    const response = await MigrateGetPolicyMapAddressGroup()
    filesAddressGroup.value = response.addressGroups
    dropdownAddressGroups.value = response.addressGroups.map(file => ({
      name: file.filename,
      code: file.id
    }))
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load files Address Group',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
const loadPolicyMapService = async () => {
  try {
    const response = await MigrateGetPolicyMapService()
    filesService.value = response.services
    dropdownServices.value = response.services.map(file => ({
      name: file.filename,
      code: file.id
    }))
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load files Service',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
const loadPolicyMapServiceGroup = async () => {
  try {
    const response = await MigrateGetPolicyMapServiceGroup()
    filesServiceGroup.value = response.serviceGroups
    dropdownServiceGroups.value = response.serviceGroups.map(file => ({
      name: file.filename,
      code: file.id
    }))
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load files Service Group',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
const validatePolicyMapClick = async () => {
  if(dropdownAddress.value === null || dropdownAddressGroup.value === null ||
     dropdownPolicy.value === null || dropdownService.value === null || dropdownServiceGroup.value === null) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please select all fields before validating',
      life: 5000
    })
    return
  }
  try {
    
    const response = await validatePolicyMap(
      dropdownPolicy.value,
      dropdownAddress.value,
      dropdownAddressGroup.value,
      dropdownService.value,
      dropdownServiceGroup.value
    )
    
    if (response.success) {
    toast.add({
      severity: 'success',
      summary: `Validation Successful TIME : ${response.time_process}`,
      detail: response.message,
      life: 5000
    })

    const updated = await MigrateFetchValidatePolicyMap()
    fetch.value = updated.services || []
    resetDropdown()
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Validation Warning',
        detail: response.message || 'Validation did not complete successfully',
        life: 5000
      })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Validation Failed',
      detail: err.message || 'An error occurred during validation',
      life: 5000
    })
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


const MigrateGetPolicyMapDelete = async (id) => {
  try {
    const response = await updateStatusDelteMigrateGetPolicyMap(id.validate_id)
    if (response.success) {
    toast.add({
      severity: 'success',
      summary: `Delete Successful TIME: ${response.time_process}`,
      detail: response.message,
      life: 5000
    })

    const updated = await MigrateFetchValidatePolicyMap()
    fetch.value = updated.services || []
    } else {
      toast.add({
        severity: 'warn',
        summary: `Validation Warning ${response.success}`,
        detail: response.message || 'Validation did not complete successfully',
        life: 5000
      })
    }

  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete data err:'+err,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
function resetDropdown() {
  dropdownPolicy.value = null
  dropdownAddress.value = null
  dropdownAddressGroup.value = null
  dropdownService.value = null
  dropdownServiceGroup.value = null
}
async function detailUse(row) {
  await router.push(`/migration/migration-policy-map-use/${row.validate_id}`)
}
</script>

<template>
  <Fluid class="flex mt-8">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl">Input Data for Validate</div>

      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex flex-col w-full">
          <label class="font-semibold text-xl mb-1">Policy</label>
          <Select 
          v-model="dropdownPolicy"
          :options="dropdownPolicys"
          optionLabel="name"
          placeholder="Select"
          class="w-full text-xl"
          @click="loadPolicyMapPolicy"
          />
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex flex-col w-full">
          <label class="font-semibold text-xl mb-1">Address</label>
          <Select 
          v-model="dropdownAddress"
          :options="dropdownAddresses"
          optionLabel="name"
          placeholder="Select"
          class="w-full text-xl"
          @click="loadPolicyMapAddress"
          />
        </div>
        <div class="flex flex-col w-full">
          <label class="font-semibold text-xl mb-1">Address Group</label>
          <Select 
          v-model="dropdownAddressGroup"
          :options="dropdownAddressGroups"
          optionLabel="name"
          placeholder="Select"
          class="w-full text-xl"
          @click="loadPolicyMapAddressGroup"
          />
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex flex-col w-full">
          <label class="font-semibold text-xl mb-1">Service</label>
          <Select 
          v-model="dropdownService"
          :options="dropdownServices"
          optionLabel="name"
          placeholder="Select"
          class="w-full text-xl"
          @click="loadPolicyMapService"
          />
        </div>
        <div class="flex flex-col w-full">
          <label class="font-semibold text-xl mb-1">Service Group</label>
          <Select 
          v-model="dropdownServiceGroup"
          :options="dropdownServiceGroups"
          optionLabel="name"
          placeholder="Select"
          class="w-full text-xl"
          @click="loadPolicyMapServiceGroup"
          />
        </div>
      </div>
      <div class="card flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
            <Button label="Validation" @click="validatePolicyMapClick" raised />
        </div>
      </div>
    </div>
  </Fluid>

  <div class="card">
    <div class="font-semibold text-xl mb-4">Uploaded Files</div>
    <DataTable
      :value="fetch"
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

      <Column field="id" header="ID" style="min-width: 1rem" />
      <Column field="policy_name" header="Policy Name" style="min-width: 10rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search mimetype" />
        </template>
      </Column>
      <Column field="address_name" header="Address Name" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search mimetype" />
        </template>
      </Column>
      <Column field="address_group_name" header="Address Group Name" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search mimetype" />
        </template>
      </Column>
      <Column field="service_name" header="Service Name" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search type" />
        </template>
      </Column>
      <Column field="validate_id" header="Validate ID" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search filename" />
        </template>
      </Column>
      <Column header="Action" style="min-width: 16rem" bodyClass="text-center">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button label="USE " icon="pi pi-info-circle" text @click="detailUse(data)"/>
            <Button label="DETAIL " icon="pi pi-info-circle" text />
            <Button label="DELETE" icon="pi pi-trash" severity="danger" text @click="MigrateGetPolicyMapDelete(data)"/>
          </div>
        </template>
      </Column>
    </DataTable>
    <ConfirmDialog />
  </div>
</template>

<style scoped>

</style>
