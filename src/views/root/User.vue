
<script setup>
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { onBeforeMount, ref } from 'vue'
import { UserService } from '../../service/UserService'

const customers1 = ref([]);
const filters1 = ref(null);
const loading1 = ref(true);

const display = ref(false);

onBeforeMount(async () => {
  initFilters1();
  await loadUsers();
})

async function loadUsers() {
  loading1.value = true;
  customers1.value = await UserService.getCustomersLarge();
  loading1.value = false;
}

function initFilters1() {
  filters1.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    full_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    phone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    position: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    role: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    is_active: { value: null, matchMode: FilterMatchMode.EQUALS }
  }
}

// ฟิลด์ form
const form = ref({
  username: '',
  full_name: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  role: 'user',
  is_active: true,
  is_locked: false,
  password: '',
  expired_at: null
})
function clearForm() {
  form.value = {
    username: '',
    full_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: 'user',
    password: '',
    is_active: true,
    is_locked: false,
    expired_at: null
  };
}
const saveUser = async () => {
  try {
    alert(JSON.stringify(form.value))
    await UserService.createUser(form.value)
    await loadUsers()  // refresh table
    clearForm()
    close()
  } catch (err) {
    console.error('Error saving user:', err)
  }
}

const roles = ['admin', 'user']

function open() {
  display.value = true
}

function close() {
  display.value = false
}


const RoleValue = ref([
    { name: 'User' },
    { name: 'Admin'},
    { name: 'Tainee'},
    { name: 'Manager'},

])
const PositionValue = ref([
    { name: 'Crew'},
    { name: 'Manager'},
    { name: 'Sales'},

])
const DepartmentValue = ref([
    { name: 'Engineer'},
    { name: 'Service'},

])

</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">EMPLOYEE</div>
    <DataTable
      :value="customers1"
      :paginator="true"
      :rows="20"
      dataKey="id"
      :rowHover="true"
      v-model:filters="filters1"
      filterDisplay="menu"
      :loading="loading1"
      :filters="filters1"
      :globalFilterFields="['full_name', 'phone', 'position', 'role']"
      showGridlines
    >
    <template #header>
    <div class="flex justify-between">
      <Button label="Add User" style="width: auto" @click="open" />
      <IconField>
          <InputIcon>
              <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters1['global'].value" placeholder="Keyword Search" />
      </IconField>
      <Button icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters1()" />
    </div>
    </template>

      <!-- FULL NAME -->
      <Column field="full_name" header="Full Name" style="min-width: 12rem">
        <template #body="{ data }">{{ data.full_name }}</template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search name" />
        </template>
      </Column>

      <!-- PHONE -->
      <Column field="phone" header="Phone" style="min-width: 10rem">
        <template #body="{ data }">{{ data.phone }}</template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search phone" />
        </template>
      </Column>

      <!-- POSITION -->
      <Column field="position" header="Position" style="min-width: 10rem">
        <template #body="{ data }">{{ data.position }}</template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search position" />
        </template>
      </Column>

      <!-- ROLE -->
      <Column field="role" header="Role" style="min-width: 10rem">
        <template #body="{ data }">{{ data.role }}</template>
        <template #filter="{ filterModel }">
          <Dropdown v-model="filterModel.value" :options="['admin', 'user']" placeholder="Select Role" showClear />
        </template>
      </Column>

      <!-- IS ACTIVE -->
      <Column field="is_active" header="Active" dataType="boolean" style="min-width: 8rem" bodyClass="text-center">
        <template #body="{ data }">
          <i class="pi" :class="{ 'pi-check-circle text-green-500': data.is_active, 'pi-times-circle text-red-500': !data.is_active }" />
        </template>
        <template #filter="{ filterModel }">
          <Checkbox v-model="filterModel.value" :indeterminate="filterModel.value === null" binary />
        </template>
      </Column>

      <!-- ACTION -->
      <Column header="Action" style="min-width: 10rem" bodyClass="text-center">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" class="mr-2" text @click="console.log('Edit', data)" />
          <Button icon="pi pi-trash" severity="danger" text @click="console.log('Delete', data)" />
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog header="Add User" v-model:visible="display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '50vw' }" :modal="true">
  <Fluid class="flex flex-col md:flex-row gap-1">
    <!-- LEFT SIDE -->
    <div class="md:w-1/2">
      <div class="card flex flex-col gap-2">
        <div class="font-semibold text-xl">Username</div>
        <IconField>
          <InputIcon class="pi pi-user" />
          <InputText v-model="form.username" placeholder="Username" />
        </IconField>

        <div class="font-semibold text-xl">Password</div>
        <IconField>
          <InputIcon class="pi pi-lock" />
          <InputText v-model="form.password" type="password" placeholder="Password" />
        </IconField>

        <div class="flex flex-wrap">
          <div class="flex flex-col grow basis-0">
            <div class="font-semibold text-xl">Active User</div>
            <ToggleSwitch v-model="form.is_active" />
          </div>
          <div class="flex flex-col grow basis-0">
            <div class="font-semibold text-xl">Lock User</div>
            <ToggleSwitch v-model="form.is_locked" />
          </div>
        </div>

        <div class="font-semibold text-xl">Start Date</div>
        <DatePicker :showIcon="true" :showButtonBar="true" v-model="form.created_at" />

        <div class="font-semibold text-xl">Role</div>
        <Select v-model="form.role" :options="RoleValue" optionLabel="name" optionValue="name" placeholder="Role" />

        <div class="font-semibold text-xl">Expire User</div>
        <DatePicker :showIcon="true" :showButtonBar="true" v-model="form.expired_at" />
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div class="md:w-1/2">
      <div class="card flex flex-col gap-2">
        <div class="font-semibold text-xl">Full Name</div>
        <IconField>
          <InputIcon class="pi pi-user" />
          <InputText v-model="form.full_name" placeholder="Full Name" />
        </IconField>

        <div class="font-semibold text-xl">Email</div>
        <IconField>
          <InputIcon class="pi pi-envelope" />
          <InputText v-model="form.email" placeholder="Email" />
        </IconField>

        <div class="font-semibold text-xl">Phone</div>
        <IconField>
          <InputIcon class="pi pi-phone" />
          <InputText v-model="form.phone" placeholder="Phone" />
        </IconField>

        <div class="font-semibold text-xl">Position</div>
        <Select v-model="form.position" :options="PositionValue" optionLabel="name" optionValue="name" placeholder="Position" />

        <div class="font-semibold text-xl">Department</div>
        <Select v-model="form.department" :options="DepartmentValue" optionLabel="name" optionValue="name" placeholder="Department" />
      </div>
    </div>
  </Fluid>

  <template #footer>
    <Button label="Save" icon="pi pi-check" @click="saveUser" />
  </template>
</Dialog>


</template>

<style scoped>
:deep(.p-datatable .pi-check-circle) {
  font-size: 1.2rem;
}
:deep(.p-datatable .pi-times-circle) {
  font-size: 1.2rem;
}
</style>