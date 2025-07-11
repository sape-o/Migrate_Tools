<template>
  <div class="full-card">
    <button class="import-btn" @click="triggerFileUpload">Import Service Group</button>
    <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" />

    <table class="policy-table">
      <thead>
        <tr>
          <th>No</th>
          <th>ชื่อไฟล์</th>
          <th>วันที่ import</th>
          <th>วันที่ไฟล์สร้าง (Create File Time)</th>
          <th>สถานะ</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in objects" :key="item.id">
          <td>{{ index + 1 }}</td>
          <td>{{ item.filename }}</td>
          <td>{{ formatDate(item.upload_date) }}</td>
          <td>{{ formatDate(item.create_file_time) }}</td>
          <td>{{ item.status }}</td>
          <td>
            <button class="action-btn detail" @click="handleAction('detail', item.id)">Detail</button>
            <button class="action-btn compare" @click="handleAction('compare', item.id)">Compare</button>
            <button class="action-btn delete" @click="handleAction('delete', item.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref(null)
const objects = ref([])  // จะเก็บข้อมูลจาก backend

// ฟังก์ชันช่วยดึง token จาก localStorage
function getToken() {
  return localStorage.getItem('token')  // ดึง token จาก localStorage
}

// ฟังก์ชันเรียกข้อมูลไฟล์จาก backend
async function fetchObjects(type = 'servicegroup') {
  const token = getToken()  // ดึง token จาก localStorage
  try {
    const res = await fetch(`http://127.0.0.1:3000/object-list?type=${encodeURIComponent(type)}`, {
      headers: {
        Authorization: `Bearer ${token}`  // ใส่ token ใน header
      }
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    objects.value = data
  } catch (error) {
    console.error('Failed to fetch objects:', error)
    alert('Failed to load file list')
  }
}

// เรียกข้อมูลตอน component โหลดเสร็จ
onMounted(() => {
  fetchObjects()
})

function triggerFileUpload() {
  fileInput.value.click()
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // เช็คว่านามสกุลไฟล์ต้องเป็น .csv เท่านั้น
  if (!file.name.toLowerCase().endsWith('.csv')) {
    alert('กรุณาเลือกไฟล์ที่นามสกุล .csv เท่านั้น')
    return
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'servicegroup') // แนบ type ด้วย

  const token = getToken()  // ดึง token จาก localStorage
  try {
    const res = await fetch('http://127.0.0.1:3000/object-upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`  // ใส่ token ใน header
      }
    })
    if (!res.ok) throw new Error(`Server error: ${res.status}`)
    const data = await res.json()
    alert(`Upload success: ${data.message || 'File uploaded'}`)
    fetchObjects()
  } catch (err) {
    console.error(err)
    alert('Upload failed')
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString()
}

async function handleAction(type, id) {
  const token = getToken()  // ดึง token จาก localStorage
  if (type === 'delete') {
    if (!confirm('คุณแน่ใจที่จะลบไฟล์นี้หรือไม่?')) return
    try {
      const res = await fetch(`http://127.0.0.1:3000/object/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`  // ใส่ token ใน header
        }
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Delete failed')
      }
      alert('ลบไฟล์สำเร็จ')
      // รีเฟรช list หลังลบ
      await fetchObjects()
    } catch (error) {
      console.error('Delete failed:', error)
      alert(`ลบไฟล์ล้มเหลว: ${error.message}`)
    }
  } else if (type === 'detail') {
    console.log('Navigating to detail:', id)
    await router.push(`/list-service-group/${id}`)
    console.log('Navigation done')
  } else {
    alert(`${type.toUpperCase()} clicked for item ID: ${id}`)
    console.log("test")
  }
}

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

.action-btn.detail {
  background-color: #2ecc71;
}

.action-btn.detail:hover {
  background-color: #27ae60;
}

.action-btn.compare {
  background-color: #f1c40f;
  color: black;
}
.action-btn.delete {
  background-color: #fe5e83;
  color: black;
}

</style>