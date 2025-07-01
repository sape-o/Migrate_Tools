<template>
  <div class="full-card">
    <button class="import-btn" @click="triggerFileUpload">Import Policy</button>
    <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" />

    <table class="policy-table">
      <thead>
        <tr>
          <th>No</th>
          <th>ชื่อ</th>
          <th>วันที่ import</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in objects" :key="item.no">
          <td>{{ item.no }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.importDate }}</td>
          <td>
            <button class="action-btn detail" @click="handleAction('detail', item.no)">Detail</button>
            <button class="action-btn compare" @click="handleAction('compare', item.no)">Compare</button>
            <button class="action-btn delete" @click="handleAction('delete', item.no)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fileInput = ref(null)

const objects = ref(
  Array.from({ length: 20 }, (_, i) => ({
    no: i + 1,
    name: `Policy ${i + 1}`,
    importDate: new Date(Date.now() - i * 86400000).toLocaleDateString()
  }))
)

function triggerFileUpload() {
  fileInput.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  fetch('http://10.99.98.111/object-upload', {
    method: 'POST',
    body: formData
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      alert(`Upload success: ${data.message || 'File uploaded'}`)
    })
    .catch(err => {
      console.error(err)
      alert('Upload failed')
    })
}

function handleAction(type, no) {
  alert(`${type.toUpperCase()} clicked for item No: ${no}`)
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
.action-btn.compare:hov
</style>