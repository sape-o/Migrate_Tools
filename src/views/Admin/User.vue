<template>
  <div class="full-card">
    <button class="import-btn" @click="showCreateModal = true">สร้างผู้ใช้ใหม่</button>

    <table class="policy-table" v-if="users.length">
      <thead>
        <tr>
          <th>No</th>
          <th>Username</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Active</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="user.id">
          <td>{{ index + 1 }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.full_name }}</td>
          <td>{{ user.email || '-' }}</td>
          <td>{{ user.phone || '-' }}</td>
          <td>{{ user.role }}</td>
          <td>{{ user.is_active ? 'Active' : 'Inactive' }}</td>
          <td>
            <button class="action-btn delete" @click="deleteUser(user.id)">ลบ</button>
            <button class="action-btn toggle" @click="toggleUserStatus(user)">{{ user.is_active ? 'Deactivate' : 'Activate' }}</button>
            <button class="action-btn edit" @click="editUser(user)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else>
      ไม่มีผู้ใช้ในระบบ
    </div>

    <!-- Modal สร้าง/แก้ไขผู้ใช้ -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEditing ? 'แก้ไขผู้ใช้' : 'สร้างผู้ใช้ใหม่' }}</h3>
        <form @submit.prevent="isEditing ? updateUser() : createUser()">
          <div class="form-group" v-for="field in fields" :key="field.key">
            <label>{{ field.label }}</label>
            <input v-model="newUser[field.key]" :type="field.type || 'text'" :required="field.required" />
          </div>

          <div class="form-group">
            <label>Role</label>
            <select v-model="newUser.role" required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newUser.is_active" />
              Active
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="import-btn">{{ isEditing ? 'บันทึกการแก้ไข' : 'บันทึก' }}</button>
            <button type="button" @click="closeModal" class="cancel-btn">ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {API_URL} from '@/APP_URL'
const users = ref([])
const showCreateModal = ref(false)
const isEditing = ref(false)
const editingUserId = ref(null)
const newUser = ref({})

const fields = [
  { key: 'username', label: 'Username', required: true },
  { key: 'full_name', label: 'Full Name', required: true },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'position', label: 'Position' },
  { key: 'department', label: 'Department' },
  { key: 'password', label: 'Password', required: false, type: 'password' }, // password ไม่บังคับให้กรอก
]

const resetUser = () => {
  newUser.value = {
    username: '',
    full_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: 'user',
    password: '',
    is_active: true
  }
}

const getToken = () => {
  return localStorage.getItem('token') || ''
}

async function fetchUsers() {
  try {
    const token = getToken() // เพิ่ม token ที่นี่
    const res = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`, // ใส่ Authorization header
      },
    })
    if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
    users.value = await res.json()
  } catch (err) {
    alert(err.message)
  }
}

async function deleteUser(id) {
  if (!confirm('ลบผู้ใช้นี้จริงหรือไม่?')) return
  try {
    const token = getToken() // เพิ่ม token ที่นี่
    const res = await fetch(`http://127.0.0.1:3000/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`, // ใส่ Authorization header
      },
    })
    if (!res.ok) throw new Error('ลบผู้ใช้ล้มเหลว')
    alert('ลบผู้ใช้สำเร็จ')
    await fetchUsers()
  } catch (err) {
    alert(err.message)
  }
}

async function toggleUserStatus(user) {
  try {
    const token = getToken() // เพิ่ม token ที่นี่
    const res = await fetch(`http://127.0.0.1:3000/users/${user.id}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`, // ใส่ Authorization header
      },
    })
    if (!res.ok) throw new Error('เปลี่ยนสถานะล้มเหลว')
    await fetchUsers()
  } catch (err) {
    alert(err.message)
  }
}

function editUser(user) {
  newUser.value = { ...user, password: '' } // ลบ password เพื่อไม่ให้แสดงเมื่อแก้ไข
  editingUserId.value = user.id
  isEditing.value = true
  showCreateModal.value = true
}

async function updateUser() {
  try {
    const payload = { ...newUser.value }

    // ถ้ามีการกรอก password ใหม่ ให้ทำการ hash ก่อน
    if (!newUser.value.password) {
      // ทำการ hash password ใหม่
      delete payload.password
    }

    // ส่งข้อมูลที่มีการแก้ไข (ไม่รวม password ถ้าไม่ได้แก้ไข)
    delete payload.id

    const token = getToken() // เพิ่ม token ที่นี่
    const res = await fetch(`http://127.0.0.1:3000/users/${editingUserId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ใส่ Authorization header
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('แก้ไขผู้ใช้ล้มเหลว')
    alert('แก้ไขผู้ใช้สำเร็จ')
    closeModal()
    await fetchUsers()
  } catch (err) {
    alert(err.message)
  }
}
async function createUser() {
  try {
    const payload = { ...newUser.value }
    
    // ถ้ากรอก password ก็ส่งไป
    if (newUser.value.password) {
      payload.password = newUser.value.password
    }

    const token = getToken() // เพิ่ม token ที่นี่
    const res = await fetch('http://127.0.0.1:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ใส่ Authorization header
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('สร้างผู้ใช้ล้มเหลว')
    alert('สร้างผู้ใช้สำเร็จ')
    closeModal()
    await fetchUsers()
  } catch (err) {
    alert(err.message)
  }
}

function closeModal() {
  showCreateModal.value = false
  isEditing.value = false
  editingUserId.value = null
  resetUser()
}

onMounted(() => {
  resetUser()
  fetchUsers()
})
</script>

<style scoped>
.full-card {
  height: calc(100vh - 40px);
  width: 100%;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  padding: 24px;
  box-sizing: border-box;
  overflow-y: auto;
}

.import-btn {
  background-color: #1abc9c;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
}

.import-btn:hover {
  background-color: #16a085;
}

.cancel-btn {
  padding: 12px 20px;       /* ขนาด padding เท่ากัน */
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
  min-width: 100px;         /* กำหนดความกว้างขั้นต่ำเท่ากัน */
  box-sizing: border-box;
  text-align: center;
  border: none;
}
.cancel-btn:hover {
  background-color: #f81818;
}

.policy-table {
  width: 100%;
  border-collapse: collapse;
}

.policy-table th,
.policy-table td {
  text-align: left;
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

.policy-table tr:hover {
  background-color: #f9f9f9;
}

.action-btn {
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
  transition: background-color 0.3s ease;
}

.action-btn.delete {
  background-color: #fe5e83;
  color: black;
}

/* Modal style */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px 32px;
  width: 600px;
  max-width: 95vw;
  box-sizing: border-box;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 20px;
}

/* Form 4 columns */
.modal form {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 16px 20px;
  grid-auto-flow: row;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  color: #444;
  margin-bottom: 6px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1abc9c;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-actions {
  grid-column: 1 / 5;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
}
.action-btn.edit {
  background-color: #3498db;
  color: white;
}

.action-btn.edit:hover {
  background-color: #2980b9;
}

.action-btn.toggle {
  background-color: #f1c40f;
  color: black;
}

.action-btn.toggle:hover {
  background-color: #d4ac0d;
}

.action-btn.delete {
  background-color: #e74c3c;
  color: white;
}

.action-btn.delete:hover {
  background-color: #c0392b;
}

</style>
